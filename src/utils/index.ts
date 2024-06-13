import { Axios, AxiosError } from "axios";
import { tierWeightList, tierIndex } from "../constants";
import { fetchSummonerId, fetchGames, updateMatchHistory } from "../services";
import { AverageTierInfo, Game, GameMode, OpScoreTimelineStatistics, OpStatistic, Participant, MyData, Tier, TierWeightList, Team, Stats, AnalysisStats } from "../types";
import champs from "../assets/champs.json";

const getChampionNameById = (id: string) : string => {
  const data: { [key: string]: string } = champs;
  return data[id];
}

const filterGamesByLatestSession = (games: Game[]) => {
  const THREE_HOURS = 3 * 60 * 60 * 1000
  const latestSession = [];
  let sessionStartTime = null;

  for (const game of games) {
      const parsedDatetime = new Date(game.created_at);
      if (!sessionStartTime || sessionStartTime.getTime() - parsedDatetime.getTime() <= THREE_HOURS) {
          sessionStartTime = parsedDatetime;
          latestSession.push(game);
      } else {
          break;
      }
  }

  return latestSession
}

function analyseGame(games: Game[], summonerId: string): OpStatistic[] {
  let allGames = games;
  let statistics = [];
  for (const game of allGames) {
    const target = game.participants.find(
      (p: Participant) => p.summoner?.summoner_id === summonerId,
    );

    if (!target) {
      continue;
    }

    const gameResult = target.stats.result;

    if (gameResult !== "WIN" && gameResult !== "LOSE") {
      // remake is currently tagged as "UNKNOWN"
      continue;
    }

    const rank = target.stats.op_score_rank;
    const role = target.role;
    const position = target.position;
    statistics.push({
      rank: rank,
      role: role,
      position: position,
      result: gameResult,
    });
  }
  return statistics;
};

function parseMap(maps: Map<number, { win?: number, lose?: number }>[]): OpScoreTimelineStatistics[] {
  const sumMap: { [second: number]: { winSum: number, winCount: number, loseSum: number, loseCount: number, totalSum: number, totalCount: number } } = {};

  for (const map of maps) {
    const entries = Array.from(map.entries());
    for (const [second, placement] of entries) {
      // Only consider intervals of 60 seconds
      if (second % 60 === 0) {
        if (!sumMap[second]) {
          sumMap[second] = { winSum: 0, winCount: 0, loseSum: 0, loseCount: 0, totalSum: 0, totalCount: 0 };
        }
        if (placement.win !== undefined) {
          sumMap[second].winSum += placement.win;
          sumMap[second].winCount += 1;
          sumMap[second].totalSum += placement.win;
          sumMap[second].totalCount += 1;
        }
        if (placement.lose !== undefined) {
          sumMap[second].loseSum += placement.lose;
          sumMap[second].loseCount += 1;
          sumMap[second].totalSum += placement.lose;
          sumMap[second].totalCount += 1;
        }
      }
    }
  }

  const result: OpScoreTimelineStatistics[] = [];
  for (const second in sumMap) {
    if (sumMap.hasOwnProperty(second)) {
      const { winSum, winCount, loseSum, loseCount, totalSum, totalCount } = sumMap[second];
      result.push({
        second: Number(second),
        winScore: winCount ? winSum / winCount : undefined,
        winCount: winCount,
        loseCount: loseCount,
        totalCount: totalCount,
        loseScore: loseCount ? loseSum / loseCount : undefined,
        score: totalCount ? totalSum / totalCount : undefined
      });
    }
  }

  return result;
}

function analyseOpScoreTimeline(games: Game[], summonerId: string): OpScoreTimelineStatistics[] {
  const gameTimeInfo = [];
  for (const game of games) {
    const rankingMap = new Map();
    const player = game.participants.find(p => p.summoner?.summoner_id === summonerId);
    if (!player) continue;

    const opScoreTimeline = player.stats.op_score_timeline;

    for (const { second, score } of opScoreTimeline) {
      const scoresAtTime: number[] = [];

      for (const participant of game.participants) {
        const timelineEntry = participant.stats.op_score_timeline.find(entry => entry.second === second);
        if (timelineEntry) {
          if (!scoresAtTime.includes(timelineEntry.score)) {
            scoresAtTime.push(timelineEntry.score);
          }
          
        }
      }

      scoresAtTime.sort((a, b) => b - a);

      const playerRank = scoresAtTime.indexOf(score) + 1;
      const resultType = player.stats.result === "WIN" ? "win" : "lose";
      
      if (!rankingMap.has(second)) {
        rankingMap.set(second, {});
      }

      const existingEntry = rankingMap.get(second);
      if (existingEntry) {
        existingEntry[resultType] = playerRank;
        rankingMap.set(second, existingEntry);
      }
    }
    gameTimeInfo.push(rankingMap);
  }

  return parseMap(gameTimeInfo);
}

function calculateTierWeight(tierInfo: AverageTierInfo, tierIndex: Record<Tier, number>) {
  if (
    tierIndex?.[tierInfo.tier] !== undefined &&
    tierInfo.division !== undefined
  ) {
    return (tierIndex[tierInfo.tier] || 0) + ((tierInfo.division ? (5 - tierInfo.division) : 0));
  }
  return null;
}

function processParticipant(participant: Participant, opScoreRanks: number[], winningScoreRanks: number[], losingScoreRanks: number[]) {
  const opScoreRank = participant.stats.op_score_rank;
  if (opScoreRank !== undefined && opScoreRank !== 0) {
    opScoreRanks.push(opScoreRank);
    if (participant.stats.result === "WIN") {
      winningScoreRanks.push(opScoreRank);
    } else if (participant.stats.result === "LOSE") {
      losingScoreRanks.push(opScoreRank);
    }
  }
}

function calculateAverageRank(scoreRanks: number[]) {
  if (scoreRanks.length === 0) {
    return '';
  }
  return (
    scoreRanks.reduce((a, b) => a + b, 0) / scoreRanks.length
  ).toFixed(2);
}

function calculateAverageTier(validTierCount: number, averageTierIndex: number, tierWeightList: TierWeightList) {
  if (validTierCount > 0) {
    averageTierIndex = Math.floor(averageTierIndex / validTierCount);
    return tierWeightList?.[averageTierIndex] || "UNKNOWN";
  }
  return "UNKNOWN";
}

function processGames(games: Game[], summonerId: string, tierIndex: Record<Tier, number>) {
  const opScoreRanks: number[] = [];
  const winningScoreRanks: number[] = [];
  const losingScoreRanks: number[] = [];
  let averageTierIndex = 0;
  let validTierCount = 0;

  games.forEach((game) => {
    const participant = game.participants.find(
      (p: Participant) => p.summoner?.summoner_id === summonerId,
    );

    if (game.average_tier_info?.tier !== undefined) {
      const tier_weight = calculateTierWeight(game.average_tier_info, tierIndex);
      if (tier_weight !== null) {
        validTierCount += 1;
        averageTierIndex += tier_weight;
      }
    }

    if (participant) {
      processParticipant(participant, opScoreRanks, winningScoreRanks, losingScoreRanks);
    }
  });

  return {
    opScoreRanks,
    winningScoreRanks,
    losingScoreRanks,
    averageTierIndex,
    validTierCount,
  };
}

export const analyseLatestGame = async (
   username: string,
   tag:string,
) : Promise<AnalysisStats[]> => {
  try {
    const summonerId = await fetchSummonerId(username, tag);
    await updateMatchHistory(summonerId);
    // Retrieve latest game regardless of game type
    let games = await fetchGames(summonerId, 20, GameMode.Total);
    if (games.length === 0) {
      return [];
    }
    const latestGame: Game = games[0];
    const participants: Participant[] = latestGame.participants;
    const selfData: MyData = latestGame.myData
    const selfTeamKey = selfData.team_key;
    const teamStat: Team | undefined = latestGame.teams.find((t) => t.key === selfTeamKey);
    // TODO: Analyse the enemy team
    const teammates: Participant[] = participants.filter((p) => p.team_key === selfTeamKey)
    const partialStats: Partial<Stats> = sumStats(teammates);
    let statistics = ""
    let allAnaylsisStats: AnalysisStats[] = [];
    teammates.forEach((teammate) => {
      allAnaylsisStats.push(collectParticipantInfo(teammate, teamStat, partialStats))
    });
    return allAnaylsisStats;
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof AxiosError) {
      return []
    } else {
      return []
    }
    
  }
}

function sumStats(participants: Participant[]): Partial<Stats> {
  const instances = participants.map((p) => p.stats);
  const summedInstance: Partial<Stats> = {};

  instances.forEach(instance => {
    for (const key in instance) {
      if (instance.hasOwnProperty(key)) {
        const typedKey = key as keyof Stats;
        if (typeof instance[typedKey] === 'number') {
          if (!summedInstance[typedKey]) {
            summedInstance[typedKey] = 0;
          }
          summedInstance[typedKey] = (summedInstance[typedKey] as number) + instance[typedKey];
        }
      }
    }
  });

  return summedInstance;
}


function collectParticipantInfo(participant: Participant, teamStat: Team | undefined, partialStats: Partial<Stats>) : AnalysisStats {
  const stats = participant.stats;
  return {
    summonerName: participant.summoner.game_name,
    championId: participant.champion_id.toString(),
    championName: getChampionNameById(participant.champion_id.toString()),
    baseStats: stats,
    position: participant.position,
    damagePerGold: (partialStats.gold_earned != undefined) ? stats.total_damage_dealt_to_champions / stats.gold_earned : -1,
    damagePerDeath: (partialStats.death != undefined) ? (stats.death == 0 ? stats.total_damage_taken : (stats.total_damage_taken / stats.death)) : -1,
  }
}

type GetDataParams = {
  username: string;
  tag: string;
  recencyFilter: boolean;
  numGames: number;
  gameMode: GameMode;
}

type GetDataResult = {
  opSummary?: string;
  opStatistics?: OpStatistic[];
  opTimeAverages?: OpScoreTimelineStatistics[];
  error?: string;
}

export const getData = async ({
  username,
  tag,
  recencyFilter,
  numGames,
  gameMode,
}: GetDataParams): Promise<GetDataResult> => {
  try {
    const summonerId: string = await fetchSummonerId(username, tag);
    await updateMatchHistory(summonerId);
    let games: Game[] = await fetchGames(summonerId, numGames, gameMode);

    if (recencyFilter) {
      games = filterGamesByLatestSession(games);
    }

    if (games.length === 0) {
      return {
        error: "No games played"
      }
    }

    const {
      opScoreRanks,
      winningScoreRanks,
      losingScoreRanks,
      averageTierIndex,
      validTierCount,
    } = processGames(games, summonerId, tierIndex); // Adjust types as needed

    if (opScoreRanks.length === 0) {
      return {
        error: "No OP Score found for the specified games"
      }
    }

    const tier: string = calculateAverageTier(validTierCount, averageTierIndex, tierWeightList);

    const statistics: OpStatistic[] = analyseGame(games, summonerId);

    const timeAverages = analyseOpScoreTimeline(games, summonerId);

    const averageWinOpScoreRank: string = calculateAverageRank(winningScoreRanks);
    const averageLoseOpScoreRank: string = calculateAverageRank(losingScoreRanks);
    const averageOpScoreRank: string = calculateAverageRank(opScoreRanks);

    const winning_index_dec: string = winningScoreRanks.length > 0 
      ? `Average Winning Rank: ${averageWinOpScoreRank} out of ${winningScoreRanks.length} games.`
      : "No winning games found.";

    const losing_index_dec: string = losingScoreRanks.length > 0 
      ? `Average Losing Rank: ${averageLoseOpScoreRank} out of ${losingScoreRanks.length} games.`
      : "No losing games found.";

    return {
      opSummary: `Average OP Rank: ${averageOpScoreRank}.\n${winning_index_dec}\n${losing_index_dec}\nAverage Tier: ${tier}`,
      opStatistics: statistics,
      opTimeAverages: timeAverages
    };
  } catch (error) {
    console.error(error)
    return {
      error: "Failed to get data; refer to console for more details"
    }
  }
};
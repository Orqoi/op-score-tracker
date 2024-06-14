import { AxiosError } from "axios";
import { tierWeightList, tierIndex } from "../constants";
import { fetchSummonerId, fetchGames, updateMatchHistory } from "../services";
import { AverageTierInfo, Game, GameMode, OpScoreTimelineStatistics, OpStatistic, Participant, MyData, Tier, TierWeightList, Team, Stats, AnalysisStats, GameStat } from "../types";
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
) : Promise<AnalysisStats[][]> => {
  try {
    const summonerId = await fetchSummonerId(username, tag);
    await updateMatchHistory(summonerId);
    // Retrieve latest game regardless of game type
    let games = await fetchGames(summonerId, 1, GameMode.Total, 1);
    if (games.length === 0) {
      return [];
    }
    const latestGame: Game = games[0];
    const participants: Participant[] = latestGame.participants;
    let teamStatsList: AnalysisStats[] = [];
    let enemyStatsList: AnalysisStats[] = [];
    const teamKey = latestGame.myData.team_key;
    const selfTeam = latestGame.teams.find(team => team.key === teamKey);
    const enemyTeam = latestGame.teams.find(team => team.key !== teamKey);

    const team_game_stat = selfTeam?.game_stat;
    const enemy_game_stat = enemyTeam?.game_stat;
    
    const selfTeamTotal = sumStats(participants.filter(participant => participant.team_key === teamKey));
    const enemyTeamTotal = sumStats(participants.filter(participant => participant.team_key !== teamKey));

    participants.forEach((participant) => {
      if (teamKey === participant.team_key) {
        teamStatsList.push(collectParticipantInfo(participant, team_game_stat, latestGame.game_length_second, selfTeamTotal));
      } else {
        enemyStatsList.push(collectParticipantInfo(participant, enemy_game_stat, latestGame.game_length_second, enemyTeamTotal));
      }
    });
    
    return [teamStatsList, enemyStatsList];
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof AxiosError) {
      return []
    } else {
      return []
    }
    
  }
}

interface TeamTotal {
  "teamDamage": number,
  "teamDamageTaken": number,
  "teamHealnShield": number,
  "teamCC": number,
  "teamVision": number,
  "teamTurretDamage": number,
  "teamObjectiveDamage": number,
  "lowestVisionScore": number,
  "highestVisionScore": number,
  "highestDeath": number,
  "lowestTurretDamage": number,
  "highestDamagePerDeath": number,
  "lowestDamagePerDeath": number
}

function sumStats(participants : Participant[]): TeamTotal {
  let sums : TeamTotal = {"teamDamage": 0, "teamDamageTaken": 0, "teamHealnShield": 0,
  "teamCC": 0, "teamVision": 0, "teamTurretDamage": 0, "teamObjectiveDamage": 0,
"lowestVisionScore": 0, "highestVisionScore": 0, "highestDeath":0, "lowestTurretDamage": 0,
"highestDamagePerDeath": 0, "lowestDamagePerDeath": 0}
  let lowestVisionScore = Number.MAX_VALUE;
  let highestVisionScore = 0;
  let highestDeath = 0;
  let lowestTurretDamage = Number.MAX_VALUE;
  let highestDamagePerDeath = 0;
  let lowestDamagePerDeath = Number.MAX_VALUE;
  for (const participant of participants) {
    const stats = participant.stats;
    sums["teamDamage"] += stats.total_damage_dealt_to_champions;
    sums["teamDamageTaken"] += stats.total_damage_taken;
    sums["teamHealnShield"] += stats.total_heal + stats.damage_self_mitigated;
    sums["teamCC"] += stats.time_ccing_others;
    sums["teamVision"] += stats.vision_score;
    sums["teamTurretDamage"] += stats.damage_dealt_to_turrets;
    sums["teamObjectiveDamage"] += stats.damage_dealt_to_objectives;

    if (stats.vision_score < lowestVisionScore) {
      lowestVisionScore = stats.vision_score;
    }
    if (stats.vision_score > highestVisionScore) {
      highestVisionScore = stats.vision_score;
    }
    if (stats.death > highestDeath) {
      highestDeath = stats.death;
    }
    if (stats.damage_dealt_to_turrets < lowestTurretDamage) {
      lowestTurretDamage = stats.damage_dealt_to_turrets;
    }

    const damagePerDeath = stats.death == 0 ? stats.total_damage_taken : (stats.total_damage_taken / stats.death);
    if (damagePerDeath > highestDamagePerDeath) {
      highestDamagePerDeath = damagePerDeath;
    }
    if (damagePerDeath < lowestDamagePerDeath) {
      lowestDamagePerDeath = damagePerDeath;
    }
  }

  sums["lowestVisionScore"] = lowestVisionScore;
  sums["highestVisionScore"] = highestVisionScore;
  sums["highestDeath"] = highestDeath;
  sums["lowestTurretDamage"] = lowestTurretDamage;
  sums["highestDamagePerDeath"] = highestDamagePerDeath;
  sums["lowestDamagePerDeath"] = lowestDamagePerDeath;

  return sums;
}


function collectParticipantInfo(participant: Participant, teamStat : GameStat | undefined, gameLength : number, teamTotal: TeamTotal) : AnalysisStats {
  const stats = participant.stats;

  // Metrics
  const damagePerGold = stats.gold_earned == 0 ? stats.total_damage_dealt_to_champions : (stats.total_damage_dealt_to_champions / stats.gold_earned);
  const damagePerDeath = stats.death == 0 ? stats.total_damage_taken : (stats.total_damage_taken / stats.death);
  const killParticipation = teamStat ? (teamStat.champion_kill == 0 ? -1 : (stats.kill + stats.assist) / teamStat.champion_kill) : 0;
  const damageProportion = teamTotal.teamDamage == 0 ? -1 : stats.total_damage_dealt_to_champions / teamTotal.teamDamage;
  const turretProportion = teamTotal.teamTurretDamage == 0 ? -1 : stats.damage_dealt_to_turrets / teamTotal.teamTurretDamage;
  const objectiveProportion = teamTotal.teamObjectiveDamage == 0 ? -1 : stats.damage_dealt_to_objectives / teamTotal.teamObjectiveDamage;

  // Current Game Time criteria:
  //  0 - Gametime < 12min (not counted), 1 - 10min <= 16min
  //  2 - 16min <= 21min, 3 -  21min <= 30min 
  //  4 - > 30min <= 40min, 5 - > 40min (late-late)
  const gameTimeCategory = gameLength < 720 ? 0 :
  (gameLength <= 960 ? 1 
    : (gameLength <= 1260 ? 2 
      : (gameLength <= 1800 ? 3 
        : (gameLength <= 2400 ? 4 : 5))));

  // Pigeon (KP + Damage proportion < 0.35 max.2) -> avr kp & dmg proportion is less than 20%
  // 1. damage proportion to neglect unlucky case 2. kp to not assign pigeon to support
  const pigeon = gameTimeCategory > 0 && killParticipation != -1 && damageProportion != -1 && (killParticipation + damageProportion) < 0.4;
  
  // Turret Allergy - (less than 2 hits of aa, approximately 200 damage to turret)
  const turretAllergy = gameTimeCategory >= 1 && teamTotal.teamTurretDamage != 0 && stats.damage_dealt_to_turrets < 200;

  // Blind: Vision Score - 1 per min ward lasted for ward placed / 1 per min lifetime left for ward kill
  // Time 0: player get 1 ward charge, at ~3:20 2nd charge, at ~6:10 3rd charge, at ~9:10 4th charge
  // Sight ward - recharge 2 - recharge-time 210 - 120 by level Last -90-120s
  // Sweep - recharge 2 - recharge-time 160 - 100 by level - each level decrease by ~3.5
  // Trinket - Farsight - TODO: VS calculation?  
  // 1. >= 2, 2. >= 5  3. >= 9 4. >= 15 5. >= 20 (Bare minimum experimental, need more samples)
  let blind = false
  if (teamTotal.teamVision != 0 && gameTimeCategory > 0 && 
    stats.vision_score == teamTotal.lowestVisionScore) {
      blind = true ? (gameTimeCategory == 1 && stats.vision_score < 3)
      || (gameTimeCategory == 2 && stats.vision_score < 6)
      || (gameTimeCategory == 3 && stats.vision_score < 10)
      || (gameTimeCategory == 4 && stats.vision_score < 15)
      || (gameTimeCategory == 5 && stats.vision_score < 21)
      : false;
  }

  // Sleep
  // Low kill participation, low damage proportions, low turret damage porportion, low objective damage proportion
  // (4 metrics, max at 1., total <= 0.5 would mean a player approximate contribution to the game < 12.5% in the game)
  const asWellSleep = gameTimeCategory > 0 && killParticipation != -1 && damageProportion != -1 && turretProportion != -1 && objectiveProportion != -1
    && (killParticipation + damageProportion + turretProportion + objectiveProportion <= 0.5);


  // Complacent
  const complacent = gameTimeCategory > 0 && stats.death === teamTotal.highestDeath && damagePerDeath === teamTotal.lowestDamagePerDeath;


  return {
    summonerName: participant.summoner.game_name,
    championId: participant.champion_id.toString(),
    championName: getChampionNameById(participant.champion_id.toString()),
    teamKey: participant.team_key,
    baseStats: stats,
    position: participant.position,
    damagePerGold: damagePerGold,
    damagePerDeath: damagePerDeath,
    gameLength: gameLength / 60,
    isBlind: blind,
    pigeon: pigeon,
    mightAsWellSleep: asWellSleep,
    complacent: complacent,
    turretAllergy: turretAllergy,
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
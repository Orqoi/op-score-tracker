import { tierWeightList, tierIndex } from "../constants";
import { fetchSummonerId, fetchGames, updateMatchHistory } from "../services";
import { AverageTierInfo, Game, GameMode, OpStatistic, Participant, MyData, Tier, TierWeightList } from "../types";

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

export const analyseLatestGame = async ({
   username,
   tag,
}: {
  username: string,
  tag: string
}) => {
  try {
    const summonerId = await fetchSummonerId(username, tag);
    await updateMatchHistory(summonerId);
    // Retrieve latest game regardless of game type
    let games = await fetchGames(summonerId, 20, GameMode.Total);
    if (games.length === 0) {
      return "No games found";
    }
    const latestGame: Game = games[0];
    const participants: Participant[] = latestGame.participants;
    const selfData: MyData = latestGame.myData
    const selfTeamKey = selfData.team_key;
    // TODO: Analyse the enemy team
    const teammates: Participant[] = participants.filter((p) => p.team_key === selfTeamKey)
    let statistics = ""
    for (const teammate of teammates) {
      // Analyse everyone in the team and find mvp/blame/searched user comment
      // Potential metric: Damage, Healing/Shielding, KDA, CS, Vision Score, OpScore
      // Potential Advanced metric: Damage to Gold/Kill ratio to find imposter
      // more logic: opscore variation in timeline
      // more logic: relations between roles to stats, e.g. tank with damage taken, controller with cc score
      // more logic: relations between positions to objectives, e.g. jungler with dragons, support with vision score
      // more logic: champion types analysis, carry jg performance vs team-oriented jg performance



    }
    return statistics;
  } catch (error: any) {
    console.error(error);
    return "Error: " + (error.response?.data?.error || "An error occurred");
  }
}

function analyseGameParticipant(participant: Participant) {
  return null;
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
    };
  } catch (error) {
    console.error(error)
    return {
      error: "Failed to get data; refer to console for more details"
    }
  }
};
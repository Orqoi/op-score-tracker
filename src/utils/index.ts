import { tierWeightList, tierIndex } from "../constants";
import { fetchSummonerId, fetchGames, updateMatchHistory } from "../services";
import { Game, MyData, Participant } from "../types/types";

const filterGamesByLatestSession = (games) => {
  const THREE_HOURS = 3 * 60 * 60 * 1000
  const latestSession = [];
  let sessionStartTime = null;

  for (const game of games) {
      const parsedDatetime = new Date(game.created_at);
      //@ts-ignore
      if (!sessionStartTime || sessionStartTime - parsedDatetime <= THREE_HOURS) {
          sessionStartTime = parsedDatetime;
          latestSession.push(game);
      } else {
          break;
      }
  }

  return latestSession
}

function analyseGame(games, summonerId) {
  let allGames = games;
  let statistics = [];
  console.log(allGames.length);
  for (const game of allGames) {
    const target = game.participants.find(
      (p) => p.summoner?.summoner_id === summonerId,
    );
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

function calculateTierWeight(tierInfo, tierIndex) {
  if (
    tierIndex?.[tierInfo.tier] !== undefined &&
    tierInfo.division !== undefined
  ) {
    return (tierIndex[tierInfo.tier] || 0) + ((tierInfo.division ? (5 - tierInfo.division) : 0));
  }
  return null;
}

function processParticipant(participant, opScoreRanks, winningScoreRanks, losingScoreRanks) {
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

function calculateAverageRank(scoreRanks) {
  if (scoreRanks.length === 0) {
    return null;
  }
  return (
    scoreRanks.reduce((a, b) => a + b, 0) / scoreRanks.length
  ).toFixed(2);
}

function calculateAverageTier(validTierCount, averageTierIndex, tierWeightList) {
  if (validTierCount > 0) {
    averageTierIndex = Math.floor(averageTierIndex / validTierCount);
    return tierWeightList?.[averageTierIndex] || "UNKNOWN";
  }
  return "UNKNOWN";
}

function processGames(games, summonerId, tierIndex) {
  const opScoreRanks = [];
  const winningScoreRanks = [];
  const losingScoreRanks = [];
  let averageTierIndex = 0;
  let validTierCount = 0;

  games.forEach((game) => {
    const participant = game.participants.find(
      (p) => p.summoner?.summoner_id === summonerId,
    );

    if (game.average_tier_info?.tier !== undefined) {
      const tier_weight = calculateTierWeight(game.average_tier_info, tierIndex);
      if (tier_weight !== null) {
        validTierCount += 1;
        averageTierIndex += tier_weight;
        console.log(game.average_tier_info?.tier, game.average_tier_info?.division, "Tier weight", tier_weight);
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
}) => {
  try {
    const summonerId = await fetchSummonerId(username, tag);
    await updateMatchHistory(summonerId);
    // Retrieve latest game regardless of game type
    let games = await fetchGames(summonerId, 20, "TOTAL");
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
  } catch (error) {
    console.error(error);
    return "Error: " + (error.response?.data?.error || "An error occurred");
  }
}

function analyseGameParticipant(Participant) {
  
  return null;
}

export const getData = async ({
  username,
  tag,
  recencyFilter,
  numGames,
  gameMode,
}) => {
  try {
    const summonerId = await fetchSummonerId(username, tag);
    await updateMatchHistory(summonerId);
    let games = await fetchGames(summonerId, numGames, gameMode);

    if (recencyFilter) {
      games = filterGamesByLatestSession(games)
    }

    if (games.length === 0) {
      return "No games played today";
    }

    const {
      opScoreRanks,
      winningScoreRanks,
      losingScoreRanks,
      averageTierIndex,
      validTierCount,
    } = processGames(games, summonerId, tierIndex);

    if (opScoreRanks.length === 0) {
      return "No OP Score found for the specified games";
    }

    const tier = calculateAverageTier(validTierCount, averageTierIndex, tierWeightList);

    const statistics = analyseGame(games, summonerId);

    const averageWinOpScoreRank = calculateAverageRank(winningScoreRanks);
    const averageLoseOpScoreRank = calculateAverageRank(losingScoreRanks);
    const averageOpScoreRank = calculateAverageRank(opScoreRanks);

    const winning_index_dec = winningScoreRanks.length > 0 
      ? `Average Winning Rank: ${averageWinOpScoreRank} out of ${winningScoreRanks.length} games.`
      : "No winning games found.\n";

    const losing_index_dec = losingScoreRanks.length > 0 
      ? `Average Losing Rank: ${averageLoseOpScoreRank} out of ${losingScoreRanks.length} games.`
      : "No losing games found.\n";

    return {
      op_summary: `Average OP Rank: ${averageOpScoreRank}.\n${winning_index_dec}\n${losing_index_dec}\nAverage Tier: ${tier}`,
      op_statistics: statistics,
    };
  } catch (error) {
    console.error(error);
    return "Error: " + (error.response?.data?.error || "An error occurred");
  }
};

import axios from "axios";
import { fetchSummonerId, fetchMatchHistory, filterGames } from "./fetch-data";
import { analyseGame } from "./analyse-game";
import { tierWeightList, tierIndex, BASE_URL } from "../constants";

export const getData = async ({
  username,
  tag,
  recencyFilter,
  counts,
  mode,
}) => {
  try {
    const summonerId = await fetchSummonerId(username, tag);

    await axios.post(`${BASE_URL}/summoner/${summonerId}/renewal`);

    const games = await fetchMatchHistory(summonerId, "");
    const last_date = games[games.length - 1].created_at;

    const sgt = new Date().getTimezoneOffset() * 60000;
    const now = new Date(Date.now() - sgt).toISOString().split("T")[0];

    let filteredGames = games;

    filteredGames = await filterGames(
      summonerId,
      filteredGames,
      last_date,
      mode,
      counts,
    );

    if (recencyFilter) {
        const latestSession = [];
        let sessionStartTime = null;

        for (const game of filteredGames) {
            const parsedDatetime = new Date(game.created_at);
            if (!sessionStartTime) {
                sessionStartTime = parsedDatetime;
                latestSession.push(game);
            } else if (parsedDatetime - sessionStartTime <= 3 * 60 * 60 * 1000) {
                latestSession.push(game);
            } else {
                break;
            }
        }

        filteredGames = latestSession;
    }

    if (filteredGames.length === 0) {
      return "No games played today";
    }
    const opScoreRanks = [];
    const winningScoreRanks = [];
    const losingScoreRanks = [];
    let averageTierIndex = 0;
    let validTierCount = 0;

    filteredGames.forEach((game) => {
      const participant = game.participants.find(
        (p) => p.summoner?.summoner_id === summonerId,
      );

      if (game.average_tier_info?.tier !== undefined) {
        // By right, if tier exists, division should exist
        // To be safe, check if division exists
        if (
          tierIndex?.[game.average_tier_info.tier] !== undefined &&
          game.average_tier_info?.division !== undefined
        ) {
          validTierCount += 1;
          const tier_weight = (tierIndex?.[game.average_tier_info?.tier] || 0) 
                            + ((game.average_tier_info?.division ? (5 - game.average_tier_info.division) : 0));

          averageTierIndex += tier_weight;
          console.log(game.average_tier_info?.tier, game.average_tier_info?.division, "Tier weight", tier_weight
          )
          
        }
      }

      if (participant) {
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
    });

    if (opScoreRanks.length === 0) {
      return "No OP Score found for the specified games";
    }

    let tier = "UNKNOWN";
    // Calculate average tier
    if (validTierCount > 0) {
      console.log(validTierCount, averageTierIndex)
      averageTierIndex = Math.floor(averageTierIndex / validTierCount);
      tier = tierWeightList?.[averageTierIndex] || "UNKNOWN";
    }

    let statistics = await analyseGame(filteredGames, summonerId);

    let winning_index_dec = "";
    let losing_index_dec = "";

    if (winningScoreRanks.length > 0) {
      const averageWinOpScoreRank = (
        winningScoreRanks.reduce((a, b) => a + b, 0) / winningScoreRanks.length
      ).toFixed(2);
      winning_index_dec = `Average Winning Rank: ${averageWinOpScoreRank} out of ${winningScoreRanks.length} games.`;
    } else {
      winning_index_dec = "No winning games found.\n";
    }

    if (losingScoreRanks.length > 0) {
      const averageLoseOpScoreRank = (
        losingScoreRanks.reduce((a, b) => a + b, 0) / losingScoreRanks.length
      ).toFixed(2);
      losing_index_dec = `Average Losing Rank: ${averageLoseOpScoreRank} out of ${losingScoreRanks.length} games.`;
    } else {
      losing_index_dec = "No losing games found.\n";
    }
    const averageOpScoreRank = (
      opScoreRanks.reduce((a, b) => a + b, 0) / opScoreRanks.length
    ).toFixed(2);
    return {
      op_summary: `Average OP Rank: ${averageOpScoreRank}.\n${winning_index_dec}\n${losing_index_dec}\nAverage Tier: ${tier}`,
      op_statistics: statistics,
    };
  } catch (error) {
    console.error(error);
    return "Error: " + (error.response?.data?.error || "An error occurred");
  }
};

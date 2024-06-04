import axios from "axios";
import { BASE_URL } from "../constants";

export const fetchSummonerId = async (username, tag) => {
  const summonerResponse = await axios.get(`${BASE_URL}/summoner/${username}/${tag}`);
  return summonerResponse.data.summonerId;
};
export const fetchMatchHistory = async (summonerId, last_date) => {
  const url = last_date
    ? `${BASE_URL}/matches/${summonerId}?ended_at=${encodeURIComponent(last_date)}&limit=20&hl=en_US`
    : `${BASE_URL}/matches/${summonerId}?limit=20&hl=en_US`;
  const matchHistoryResponse = await axios.get(url);
  return matchHistoryResponse.data;
};

const filterByGameMode = async (summonerId, games, mode) => {
  return games.filter((game) => {
    const participant = game.participants.find(
      (p) => p.summoner?.summoner_id === summonerId,
    );
    const opScoreRank = participant?.stats.op_score_rank;

    // Check if the op_score_rank is valid
    if (opScoreRank === undefined || opScoreRank === 0) {
      return false;
    }

    // Check game mode -> TWO GAME MODE OPTIONS: ARAM & NORMS
    if (mode !== "ARAM") {
      return (
        game.queue_info.game_type === "SOLORANKED" ||
        game.queue_info.game_type === "NORMAL" ||
        game.queue_info.game_type === "FLEXRANKED"
      );
    }

    return game.queue_info.game_type === mode;
  });
};

export const filterGames = async (
  summonerId,
  games,
  mode,
  counts,
) => {
  const last_date = games[games.length - 1].created_at;
  let filteredGames = await filterByGameMode(summonerId, games, mode);
  let gameCounts = parseInt(counts);
  let current_last_date = last_date;
  while (filteredGames.length < gameCounts) {
    let moreGames = await fetchMatchHistory(summonerId, current_last_date);

    // Extract last game info before filtering
    if (moreGames.length === 0) {
      break;
    }
    current_last_date = moreGames[moreGames.length - 1].created_at;

    // Filter by game mode
    moreGames = await filterByGameMode(summonerId, moreGames, mode);
    filteredGames = filteredGames.concat(moreGames);
    if (filteredGames.length >= gameCounts) {
      filteredGames = filteredGames.slice(0, gameCounts);
      break;
    }
  }
  return filteredGames;
};

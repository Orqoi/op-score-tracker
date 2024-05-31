import axios from 'axios';

export const fetchSummonerId = async (username, tag) => {
    const summonerResponse = await axios.get(`/summoner/${username}/${tag}`);
    return summonerResponse.data.summonerId;
}
export const fetchMatchHistory = async (summonerId, last_date) => {
    const url = last_date 
    ? `/matches/${summonerId}?ended_at=${encodeURIComponent(last_date)}&limit=20&hl=en_US`
    : `/matches/${summonerId}?limit=20&hl=en_US`;
    const matchHistoryResponse = await axios.get(url);
    return matchHistoryResponse.data;
}

export const filterGames = async (summoner_id, games, last_date, mode, counts) => {
    let filteredGames = games;
    let gameCounts = parseInt(counts);
    if (mode !== "ALL") {
        filteredGames = games.filter(game => {
            if (mode === "ARAM") {
              return game.queue_info.game_type === mode;
            } else {
              return game.queue_info.game_type === "SOLORANKED" || game.queue_info.game_type === "NORMAL" || game.queue_info.game_type === "FLEXRANKED";
            }
          });
    }
    let current_last_date = last_date;
    while (filteredGames.length < gameCounts && gameCounts > 0) {
        const moreGames = await fetchMatchHistory(summoner_id, current_last_date);
        if (moreGames.length === 0) {
            break;
        }
        current_last_date = moreGames[moreGames.length - 1].created_at;
        filteredGames = filteredGames.concat(moreGames);
        if (filteredGames.length >= gameCounts) {
            filteredGames = filteredGames.slice(0, gameCounts);
            break;
        }
    }
    return filteredGames;
}
import type { GameMode } from "../types";
import { BASE_URL } from "../constants";
import axios from "axios";

export const fetchSummonerId = async (username: string, tag: string) => {
    const summonerResponse = await axios.get(`${BASE_URL}/summoner/${username}/${tag}`);
    return summonerResponse.data.summonerId;
};

export const fetchGames = async (summonerId: string, numGames: number, gameMode: GameMode) => {
    let url = `${BASE_URL}/matches/${summonerId}?limit=20&hl=en_US`
    const allGames = [];
    if (gameMode) {
        url += `&game_type=${gameMode}`
    }

    if (numGames) {
        let endedAt = '';
        while (allGames.length < numGames) {
            const response = await axios.get(url + (endedAt ? `&ended_at=${encodeURIComponent(endedAt)}` : endedAt))
            const games = await response.data
            if (games.length === 0) {
                break;
            }
            allGames.push(...games);

            if (allGames.length >= numGames) {
                allGames.splice(numGames);
                break;
            }

            endedAt = games[games.length - 1].created_at;
        }
    }
    return allGames;
};


export const updateMatchHistory = async (summonerId: string) => {
    await axios.post(`${BASE_URL}/summoner/${summonerId}/renewal`);
}

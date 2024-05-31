import axios from 'axios';
import { fetchSummonerId, fetchMatchHistory, filterGames } from './helper';

export const getData = async ({username, tag, recencyFilter, counts, mode}) => {
    try {
        const summonerId  = await fetchSummonerId(username, tag);

        await axios.post(`/summoner/${summonerId}/renewal`);

        const games = await fetchMatchHistory(summonerId, "");
        const last_date = games[games.length - 1].created_at;

        const sgt = new Date().getTimezoneOffset() * 60000;
        const now = new Date(Date.now() - sgt).toISOString().split('T')[0];

        let filteredGames = games;

        filteredGames = await filterGames(summonerId, filteredGames, last_date, mode, counts);

        if (recencyFilter) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            filteredGames = games.filter(game => {
                const gameDate = new Date(game.created_at).toISOString().split('T')[0];
                return gameDate === today || gameDate === yesterday;
            });
        }

        
        if (filteredGames.length === 0) {
            return 'No games played today';
        }

        const opScoreRanks = filteredGames.map(game =>
            game.participants.find(p => p.summoner.summoner_id === summonerId)?.stats.op_score_rank
        ).filter(rank => rank !== undefined);

        console.log(opScoreRanks);

        if (opScoreRanks.length === 0) {
            return 'No OP Score found for the specified games';
        }

        const averageOpScoreRank = (opScoreRanks.reduce((a, b) => a + b, 0) / opScoreRanks.length).toFixed(2);
        console.log(averageOpScoreRank)
        return `Average OP Score Rank for the ${counts} filtered ${mode} games: ${averageOpScoreRank}`;
    } catch (error) {
        return 'Error: ' + (error.response?.data?.error || 'An error occurred');
    }
};
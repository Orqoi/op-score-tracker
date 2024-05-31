import axios from 'axios';

export const getData = async ({username, tag, recencyFilter}) => {
    try {
        const summonerResponse = await axios.get(`/summoner/${username}/${tag}`);
        const { summonerId } = summonerResponse.data;

        await axios.post(`/summoner/${summonerId}/renewal`);

        const matchHistoryResponse = await axios.get(`/matches/${summonerId}`);
        const games = matchHistoryResponse.data;

        const sgt = new Date().getTimezoneOffset() * 60000;
        const now = new Date(Date.now() - sgt).toISOString().split('T')[0];

        let filteredGames = games;

        if (recencyFilter) {
            const latestSession = [];
            let sessionStartTime = null;

            for (const game of games) {
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
        } else {
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
        return `Average OP Score for the filtered games: ${averageOpScoreRank}`;
    } catch (error) {
        return 'Error: ' + (error.response?.data?.error || 'An error occurred');
    }
};
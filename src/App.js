import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [username, setUsername] = useState('');
    const [tag, setTag] = useState('');
    const [recencyFilter, setRecencyFilter] = useState(false);
    const [result, setResult] = useState('');

    const handleSubmit = async () => {
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
              setResult('No games played today');
              return;
          }
  
          const opScoreRanks = filteredGames.map(game =>
              game.participants.find(p => p.summoner.summoner_id === summonerId)?.stats.op_score_rank
          ).filter(rank => rank !== undefined);
  
          if (opScoreRanks.length === 0) {
              setResult('No OP Score Ranks found for the specified games');
              return;
          }
  
          const averageOpScoreRank = (opScoreRanks.reduce((a, b) => a + b, 0) / opScoreRanks.length).toFixed(2);
          setResult(`Average OP Score Rank for the filtered games: ${averageOpScoreRank}`);
      } catch (error) {
          setResult('Error: ' + (error.response?.data?.error || 'An error occurred'));
      }
  };
  

    return (
        <div style={{ padding: '20px' }}>
            <h1>OP.GG Average OP Score Rank Calculator</h1>
            <div>
                <label>Enter username:</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div>
                <label>Enter tag:</label>
                <input type="text" value={tag} onChange={e => setTag(e.target.value)} />
            </div>
            <div>
                <input type="checkbox" checked={recencyFilter} onChange={e => setRecencyFilter(e.target.checked)} />
                <label>Enable recency filter</label>
            </div>
            <button onClick={handleSubmit}>Calculate</button>
            <div style={{ marginTop: '20px', color: 'red' }}>{result}</div>
        </div>
    );
}

export default App;

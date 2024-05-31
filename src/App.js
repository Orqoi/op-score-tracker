import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [username, setUsername] = useState('');
    const [tag, setTag] = useState('');
    const [mode, setMode] = useState('ALL');
    const [counts, setCounts] = useState('20'); 
    const [recencyFilter, setRecencyFilter] = useState(false);
    const [result, setResult] = useState('');

    const handleSubmit = async () => {
      try {
          const summonerId  = await fetchSummonerId(username, tag);
          console.log(summonerId)
          await axios.post(`/summoner/${summonerId}/renewal`);
          const games = await fetchMatchHistory(summonerId, ""); 
          const last_date = games[games.length - 1].created_at;
          const sgt = new Date().getTimezoneOffset() * 60000;
          const now = new Date(Date.now() - sgt).toISOString().split('T')[0];
          let filteredGames = games;
          if (recencyFilter) {
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            filteredGames = games.filter(game => {
                const gameDate = new Date(game.created_at).toISOString().split('T')[0];
                return gameDate === today || gameDate === yesterday;
            });
          }

          filteredGames = await filterGames(summonerId, filteredGames, last_date);
          console.log(filteredGames)
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
          setResult(`Average OP Score Rank for the ${counts} filtered ${mode} games: ${averageOpScoreRank}`);
      } catch (error) {
          console.log(error);
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
            <label>Select Total Games:</label>
                <select value={counts} onChange={e => setCounts(e.target.value)}>
                    <option value="20">20</option>
                    <option value="40">40</option>
                    <option value="60">60</option>
                    <option value="80">80</option>
                    <option value="100">100</option>
                </select>
            </div>
            <div>
            <label>Select mode:</label>
                <select value={mode} onChange={e => setMode(e.target.value)}>
                    <option value="">Select mode</option>
                    <option value="ALL">ALL</option>
                    <option value="ARAM">ARAM</option>
                    <option value="NORMALS">NORMS & RANK</option>
                </select>
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

export const analyseGame = async (games, summonerId) => {
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

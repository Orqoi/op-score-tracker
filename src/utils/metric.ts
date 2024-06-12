import { AnalysisStats } from "../types";
// Analyse everyone in the team and find mvp/blame/searched user comment
      // Potential metric: Damage, Healing/Shielding, KDA, CS, Vision Score, OpScore
      // Potential Advanced metric: Damage to Gold/Kill ratio to find imposter
      // more logic: opscore variation in timeline
      // more logic: relations between roles to stats, e.g. tank with damage taken, controller with cc score
      // more logic: relations between positions to objectives, e.g. jungler with dragons, support with vision score
      // more logic: champion types analysis, carry jg performance vs team-oriented jg performance
  
// TODO: rename the function to be more descriptive
function metric1(analysisStats: AnalysisStats) : string {
    let report = "";
    // TODO: consider role/position relations
    const goldRanking = analysisStats.goldRanking;
    const damagePerGoldRanking = analysisStats.damagePerGoldRanking;
    const diff = goldRanking - damagePerGoldRanking;
    // cp1: report of gold rank & damage per gold
    if (diff > 2) {
        report += "You probably do not deserve the gold for the damage you deal."
    }

    return report
}
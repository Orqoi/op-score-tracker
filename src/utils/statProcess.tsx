import { AnalysisStats, Stats } from "../types";

const createSortedStatsNumberData = <T extends keyof Stats>(
    data: AnalysisStats[],
    keyName: string,
    key: T
  ) => {
    if (!data) return [];
    return data
      .map((item) => ({
        name: item.summonerName,
        [keyName]: item.baseStats[key],
      }))
      .sort((a, b) => (a[keyName] as number) - (b[keyName] as number));
  };

export const processAnalysisData = async (data: AnalysisStats[][]) => {
    const teamData : AnalysisStats[] = !data[0] ? [] : data[0];
    const enemyData : AnalysisStats[] = data.length < 2 ? [] : data[1];
    // Sorted Stats Data
    const sortedDeathData = createSortedStatsNumberData(teamData, "Death", "death");
    const sortedGoldEarnedData = createSortedStatsNumberData(teamData, "GoldEarned", "gold_earned");
    const sortedCCData = createSortedStatsNumberData(teamData, "CcTime", "time_ccing_others");
    const sortedObjectDamage = createSortedStatsNumberData(teamData, "ObjectiveDamage", "damage_dealt_to_objectives");
    const sortedTurretDamage = createSortedStatsNumberData(teamData, "TurretDamage", "damage_dealt_to_turrets");

    // TODO: does self-mitigated include shields to teammates?
    const sortedHealAndShieldData = teamData.map((item) => ({
        name: item.summonerName,
        HealnShield: item.baseStats.total_heal + item.baseStats.damage_self_mitigated,
      })).sort((a, b) => a.HealnShield - b.HealnShield);

    // Sorted Analysis data
      const sortedDamagePerGoldData = teamData.map((item) => ({
        name: item.summonerName,
        DamagePerGold: item.damagePerGold,
      })).sort((a, b) => a.DamagePerGold - b.DamagePerGold);

      const sortedDamagePerDeathData = teamData.map((item) => ({
        name: item.summonerName,
        DamageTakenPerDeath: item.damagePerDeath,
      })).sort((a, b) => a.DamageTakenPerDeath - b.DamageTakenPerDeath);


    
    return {sortedDeathData, sortedGoldEarnedData, sortedCCData, sortedObjectDamage, sortedTurretDamage, sortedDamagePerGoldData, sortedDamagePerDeathData, sortedHealAndShieldData};
}

export const processTitles = async (teamData: AnalysisStats[][], data: {[x:string]: {
    [x: string]: string | number;
    name: string;
}[]}) => {
    const ownTeamData = teamData[0] ?? [];
    // Sorted Stats Data
    const sortedCCData = data?.sortedCCData ?? [];
    const sortedObjectDamage = data?.sortedObjectDamage ?? [];
    const sortedTurretDamage = data?.sortedTurretDamage ?? [];
    const sortedHealAndShieldData = data?.sortedHealAndShieldData ?? [];
    const sortedDamagePerGoldData = data?.sortedDamagePerGoldData ?? [];
    const sortedDamagePerDeathData = data?.sortedDamagePerDeathData ?? [];

    // TODO: Re-write this to allow same-stats player
    let titles = [
        {'label': 'Labour Force', 'name' : sortedDamagePerGoldData.length > 4 ? sortedDamagePerGoldData[4].name : ''},
        {'label': '50 Cent', 'name' : sortedDamagePerDeathData.length > 4 ? sortedDamagePerDeathData[4].name : ''},
        {'label': 'Objectives', 'name': sortedObjectDamage.length > 4 ? sortedObjectDamage[4].name : ''},
        {'label': 'Bin Laden', 'name': sortedTurretDamage.length > 4 ? sortedTurretDamage[4].name : ''},
        {'label': 'Combat medic', 'name': sortedHealAndShieldData.length > 4 ? sortedHealAndShieldData[4].name : ''},
        {'label': 'Medusa', 'name': sortedCCData.length > 4 ? sortedCCData[4].name : ''},
    ];

    ownTeamData.forEach((item) => {
        if (item.turretAllergy) {
            titles.push({'label': 'Turret Allergy', 'name': item.summonerName});
        }

        if (item.isBlind) {
            titles.push({'label': 'Blind', 'name': item.summonerName});
        }

        if (item.pigeon) {
            titles.push({'label': 'Pigeon', 'name': item.summonerName});
        }

        if (item.mightAsWellSleep) {
            titles.push({'label': 'Might as well sleep', 'name': item.summonerName});
        }


        if (item.complacent) {
            titles.push({'label': 'Complacent', 'name': item.summonerName});
        }
    })
    return titles;
}
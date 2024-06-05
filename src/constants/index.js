export const tierWeightList = {
  1: "Iron4",
  2: "Iron3",
  3: "Iron2",
  4: "Iron1",
  5: "Bronze4",
  6: "Bronze3",
  7: "Bronze2",
  8: "Bronze1",
  9: "Silver4",
  10: "Silver3",
  11: "Silver2",
  12: "Silver1",
  13: "Gold4",
  14: "Gold3",
  15: "Gold2",
  16: "Gold1",
  17: "Platinum4",
  18: "Platinum3",
  19: "Platinum2",
  20: "Platinum1",
  21: "Emerald4",
  22: "Emerald3",
  23: "Emerald2",
  24: "Emerald1",
  25: "Diamond4",
  26: "Diamond3",
  27: "Diamond2",
  28: "Diamond1",
  29: "Master",
  30: "Grandmaster",
  31: "Challenger",
};

export const tierIndex = {
  IRON: 0,
  BRONZE: 4,
  SILVER: 9,
  GOLD: 13,
  PLATINUM: 17,
  EMERALD: 21,
  DIAMOND: 24,
  // Would expect no division value for master, grandmaster, and challenger
  // Could be wrong 
  MASTER: 29,
  GRANDMASTER: 30,
  CHALLENGER: 31,
};

export const gameModeOptions = [
  { value: "total", label: "ALL" },
  { value: "aram", label: "ARAM" },
  { value: "normal", label: "Normal" },
  { value: "soloranked", label: "Ranked Solo/Duo" },
  { value: "flexranked", label: "Ranked Flex" },
  { value: "bot", label: "Co-op vs. AI" },
  { value: "urf", label: "AR Ultra Rapid Fire" },
  { value: "clash", label: "Clash" },
  { value: "nexus_blitz", label: "Nexus Blitz" },
  { value: "event", label: "Featured" }
];
export const numGamesOptions = [
  { value: 20, label: "20" },
  { value: 40, label: "40" },
  { value: 60, label: "60" },
  { value: 80, label: "80" },
  { value: 100, label: "100" },
];

export const BASE_URL = process.env.REACT_APP_ENV === 'production' ? process.env.REACT_APP_PROD_URL : process.env.REACT_APP_DEV_URL;

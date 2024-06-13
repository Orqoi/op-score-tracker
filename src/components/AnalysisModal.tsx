import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import type { AnalysisStats, Stats } from "../types";
import ChartSection from "./chart/ChartSection";

type AnalysisModalProps = {
  open: boolean;
  handleClose: () => void;
  data: AnalysisStats[];
}

const sortStatsData = (data: AnalysisStats[], key: keyof Stats) => {
    return [...data].sort((a, b) => a.baseStats[key] - b.baseStats[key]);
  };

const positionOrder = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT", "Unknown"];
const sortedPositionData = (data: AnalysisStats[]) => {
    return [...data].sort((a, b) => {
      const posA = a.position || "Unknown";
      const posB = b.position || "Unknown";
      return positionOrder.indexOf(posA) - positionOrder.indexOf(posB);
    });
  };

  const createSortedStatsNumberData = <T extends keyof Stats>(
    data: AnalysisStats[],
    keyName: string,
    key: T
  ) => {
    return data
      .map((item) => ({
        name: item.summonerName,
        [keyName]: item.baseStats[key],
      }))
      .sort((a, b) => (a[keyName] as number) - (b[keyName] as number));
  };

const AnalysisModal : React.FC<AnalysisModalProps> = ({ open, handleClose, data }) => {  
``  // Sorted Stats Data
    const sortedDeathData = createSortedStatsNumberData(data, "Death", "death");
    const sortedGoldEarnedData = createSortedStatsNumberData(data, "GoldEarned", "gold_earned");
    const sortedCCData = createSortedStatsNumberData(data, "CcTime", "time_ccing_others");
    const sortedObjectDamage = createSortedStatsNumberData(data, "ObjectiveDamage", "damage_dealt_to_objectives");
    const sortedTurretDamage = createSortedStatsNumberData(data, "TurretDamage", "damage_dealt_to_turrets");

    // TODO: does self-mitigated include shields to teammates?
    const sortedHealAndShieldData = data.map((item) => ({
        name: item.summonerName,
        HealnShield: item.baseStats.total_heal + item.baseStats.damage_self_mitigated,
      })).sort((a, b) => a.HealnShield - b.HealnShield);

    // Sorted Analysis data
      const sortedDamagePerGoldData = data.map((item) => ({
        name: item.summonerName,
        DamagePerGold: item.damagePerGold,
      })).sort((a, b) => a.DamagePerGold - b.DamagePerGold);

      const sortedDamagePerDeathData = data.map((item) => ({
        name: item.summonerName,
        DamageTakenPerDeath: item.damagePerDeath,
      })).sort((a, b) => a.DamageTakenPerDeath - b.DamageTakenPerDeath);

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
          <DialogTitle sx={{ color: '#1976d2', fontSize: 30, fontWeight: 'medium' }}>Analysis</DialogTitle>
          <DialogContent>
          <Box m={3} justifyContent="center">
            <Typography color='#1976d2' variant="h6" gutterBottom>
              Player Positions
            </Typography>
            <TableContainer component={Paper}>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                   <TableCell>Summoner Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Kda</TableCell>
                    <TableCell>Minions</TableCell>
                    <TableCell>Jungle</TableCell>
                    <TableCell>Vision Score</TableCell>
                    <TableCell>Pink</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedPositionData(data).map((item) => (
                    <TableRow key={item.summonerName}>
                      <TableCell>{item.summonerName}</TableCell>
                      <TableCell>{item.position || "Unknown"}</TableCell>
                      <TableCell>{`${item.baseStats.kill}/${item.baseStats.death}/${item.baseStats.assist}`}</TableCell>
                      <TableCell>{item.baseStats.minion_kill}</TableCell>
                      <TableCell>{item.baseStats.neutral_minion_kill}</TableCell>
                      <TableCell>{item.baseStats.vision_score}</TableCell>
                      <TableCell>{item.baseStats.vision_wards_bought_in_game}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
           {/* Gold & damage per gold */}
            <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Gold Earned"
                    data={sortedGoldEarnedData}
                    dataKey="GoldEarned"
                    color="#8884d8"
                />
                <ChartSection
                    title="Damage Per Gold"
                    data={sortedDamagePerGoldData}
                    dataKey="DamagePerGold"
                    color="#82ca9d"
                />
            </Box>

            {/* death & damage taken per death */}
            <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Death"
                    data={sortedDeathData}
                    dataKey="Death"
                    color="#8884d8"
                />
                <ChartSection
                    title="Damage Taken Per Death"
                    data={sortedDamagePerDeathData}
                    dataKey="DamageTakenPerDeath"
                    color="#82ca9d"
                />
            </Box>
        
            {/*  Heals-Shields & CC */}
            <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Heal & Shields"
                    data={sortedHealAndShieldData}
                    dataKey="HealnShield"
                    color="#8884d8"
                />
                <ChartSection
                    title="Total CC Time to Enemy"
                    data={sortedCCData}
                    dataKey="CcTime"
                    color="#82ca9d"
                />
            </Box>
            
            {/*  Objectives damage & turret kill */}
            <Box display="flex" height="70%" justifyContent="space-between">
                  <ChartSection
                    title="Damage Dealt to Objectives"
                    data={sortedObjectDamage}
                    dataKey="ObjectiveDamage"
                    color="#8884d8"
                  />
                  <ChartSection
                    title="Damage to Turret"
                    data={sortedTurretDamage}
                    dataKey="TurretDamage"
                    color="#82ca9d"
                  />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
    );
  };
  
  export default AnalysisModal;
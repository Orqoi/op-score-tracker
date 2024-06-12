import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
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

type AnalysisModalProps = {
  open: boolean;
  handleClose: () => void;
  data: AnalysisStats[];
}

const sortStatsData = (data: AnalysisStats[], key: keyof Stats) => {
    return [...data].sort((a, b) => a.baseStats[key] - b.baseStats[key]);
  };

const sortAnalysisData = (data: AnalysisStats[]) => {
    return [...data].sort((a, b) => a["damagePerGold"] - b["damagePerGold"]);
  };

const AnalysisModal : React.FC<AnalysisModalProps> = ({ open, handleClose, data }) => {  
    const sortedGoldEarnedData = sortStatsData(data, "gold_earned").map((item) => ({
        name: item.summonerName,
        goldEarned: item.baseStats.gold_earned,
      }));
    
      const sortedDamagePerGoldData = sortAnalysisData(data).map((item) => ({
        name: item.summonerName,
        damagePerGold: item.damagePerGold,
      }));

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
          <DialogTitle>Player Stats</DialogTitle>
          <DialogContent>
            <Box display="flex" justifyContent="space-between">
              <Box width="48%">
                <Typography variant="h6" gutterBottom>
                  Gold Earned
                </Typography>
                <BarChart
                  width={500}
                  height={300}
                  data={sortedGoldEarnedData.map((item) => ({
                    name: item.name,
                    goldEarned: item.goldEarned,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end"/>
                  <YAxis />
                  <Tooltip />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: 35 }}
                    />
                  <Bar dataKey="goldEarned" fill="#8884d8" />
                </BarChart>
              </Box>
              <Box width="48%">
                <Typography variant="h6" gutterBottom>
                  Damage Per Gold
                </Typography>
                <BarChart
                  width={500}
                  height={300}
                  data={sortedDamagePerGoldData.map((item) => ({
                    name: item.name,
                    damagePerGold: item.damagePerGold,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-20} textAnchor="end"/>
                  <YAxis />
                  <Tooltip />
                  <Legend
                    align="center"
                    verticalAlign="bottom"
                    wrapperStyle={{ paddingTop: 35 }}
                    />
                  <Bar dataKey="damagePerGold" fill="#82ca9d" />
                </BarChart>
              </Box>
            </Box>
            {/* Additional charts can be placed here */}
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
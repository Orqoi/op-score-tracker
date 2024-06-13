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
import type { OpScoreTimelineStatistics, OpStatistic } from "../types";

type ChartModalProps = {
  open: boolean;
  handleClose: () => void;
  data: OpStatistic[];
  timeAverages: OpScoreTimelineStatistics[];
}

enum ChartFilter {
  ALL = "ALL",
  WIN = "WIN",
  LOSE = "LOSE"
}

type GroupedData = {
  [key: string | number]: OpStatistic[];
};

const ChartModal: React.FC<ChartModalProps> = ({ open, handleClose, data, timeAverages }) => {
  function calculateScoreFrequencies(statistics: OpStatistic[], result: ChartFilter) {
    let parsedData = statistics.filter(stat => stat.rank !== 0).map(stat => stat.rank);
    if (result !== ChartFilter.ALL) {
      parsedData = statistics.filter(stat => stat.result === result && stat.rank !== 0).map(stat => stat.rank)
    }
    const frequencyMap = parsedData.reduce((acc: { [key: string] : number }, num: number) => {
      acc[num] = (acc[num] || 0) + 1;
      return acc;
  }, {});
  
    return Object.keys(frequencyMap).map(score => ({
        score: Number(score),
        frequency: frequencyMap[score]
    }));
  }
  const [selectedRankType, setSelectedRankType] = useState<ChartFilter>(ChartFilter.ALL);

  const handleButtonClick = (rankType: ChartFilter) => {
    setSelectedRankType(rankType);
  };

  const processData = (groupByKey: keyof OpStatistic) => {
    if (!data || data.length === 0) return [];
    const filteredData = data.filter((item) => item[groupByKey] !== null);
    const groupedData = filteredData.reduce((acc: GroupedData, item) => {
      const key = item[groupByKey];
      if (!acc.key) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});

    return Object.keys(groupedData).map((key) => ({
      [groupByKey]: key,
      rank:
        groupedData[key].reduce((sum, item) => sum + item.rank, 0) /
        groupedData[key].length,
    }));
  };

  const processWinLoseData = (groupByKey: keyof OpStatistic, result: ChartFilter) => {
    if (!data) return [];
    const filteredData = data.filter(
      (item) => item.result === result && item[groupByKey] !== null,
    );
    const groupedData = filteredData.reduce((acc: GroupedData, item) => {
      const key = item[groupByKey];
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    return Object.keys(groupedData).map((key) => ({
      [groupByKey]: key,
      rank:
        groupedData[key].reduce((sum, item) => sum + item.rank, 0) /
        groupedData[key].length,
    }));
  };

  const getChartData = (groupByKey: keyof OpStatistic) => {
    switch (selectedRankType) {
      case ChartFilter.WIN:
        return processWinLoseData(groupByKey, ChartFilter.WIN);
      case ChartFilter.LOSE:
        return processWinLoseData(groupByKey, ChartFilter.LOSE);
      default:
        return processData(groupByKey);
    }
  };

  const renderTimeline = () => {
    switch (selectedRankType) {
      case ChartFilter.WIN:
        return <Line dataKey="winScore" stroke="#00aaff" />
      case ChartFilter.LOSE:
        return <Line dataKey="loseScore" stroke="#ff0000" />
      default:
        return <Line dataKey="score" stroke="#000000" />
    }          
  }

  function formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  const renderTimelineLabel = (label: any, payload: any) => {
   
    switch (selectedRankType) {
      case ChartFilter.WIN:
        return `${formatTime(Number(payload[0]?.payload?.second))} - ${payload[0]?.payload?.winCount} games`
      case ChartFilter.LOSE:
        return `${formatTime(Number(payload[0]?.payload?.second))} - ${payload[0]?.payload?.loseCount} games`
      default:
        return `${formatTime(Number(payload[0]?.payload?.second))} - ${payload[0]?.payload?.totalCount} games`
    }          
  }
  const positionData = getChartData("position");
  const roleData = getChartData("role");
  // const positionRoleData = getChartData(
  //   (item) => `${item.position}-${item.role}`,
  // );

  const renderXAxis = (dataKey: string) => (
    <XAxis
      dataKey={dataKey}
      tick={{ fontSize: 11 }}
    />
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>League of Legends OP Score Tracker</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={4} mr={25}>
          <Button
            variant="contained"
            onClick={() => handleButtonClick(ChartFilter.ALL)}
            sx={{ mx: 1 }}
          >
            ALL
          </Button>
          <Button
            variant="contained"
            onClick={() => handleButtonClick(ChartFilter.WIN)}
            sx={{ mx: 1 }}
          >
            WIN
          </Button>
          <Button
            variant="contained"
            onClick={() => handleButtonClick(ChartFilter.LOSE)}
            sx={{ mx: 1 }}
          >
            LOSE
          </Button>
        </Box>
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Position - Op_Rank Chart
          </Typography>
          <BarChart width={1000} height={320} data={positionData}>
            <CartesianGrid strokeDasharray="3 3" />
            {renderXAxis("position")}
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <Tooltip />
            <Legend
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ paddingLeft: 20, paddingTop: 20 }}
            />
            <Bar dataKey="rank" fill="#8884d8" />
          </BarChart>
        </Box>
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Role - Op_Rank Chart
          </Typography>
          <BarChart width={1000} height={320} data={roleData}>
            <CartesianGrid strokeDasharray="3 3" />
            {renderXAxis("role")}
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <Tooltip />
            <Legend
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ paddingLeft: 20, paddingTop: 20 }}
            />
            <Bar dataKey="rank" fill="#82ca9d" />
          </BarChart>
        </Box>
        {/*
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Position-Role to Op_Rank (To be implemented)
          </Typography>
          <BarChart width={600} height={300} data={positionRoleData}>
            <CartesianGrid strokeDasharray="3 3" />
            {renderXAxis("position-role")}
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="top"
              wrapperStyle={{ paddingLeft: 20, paddingTop: 20 }}
            />
            <Bar dataKey="rank" fill="#ffc658" />
          </BarChart>
         
        </Box> */}
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Game Time Average - Op_Rank Chart
          </Typography>
          <LineChart width={1000} height={320} data={timeAverages}>
            <CartesianGrid strokeDasharray="3" />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <XAxis tickFormatter={() => ""} interval={0} />
            <Legend
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ paddingLeft: 20, paddingTop: 20 }}
            />
            <Tooltip 
              labelFormatter={(label, payload) => renderTimelineLabel(label, payload)}
              formatter={(value, name) => [<>Average OP Score Placement: {Number(value).toFixed(2)}</>]}
            />
            {renderTimeline()}
          </LineChart>
        </Box>
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Frequency - Op_Rank Chart
          </Typography>
          <BarChart width={1000} height={320} data={calculateScoreFrequencies(data, selectedRankType)}>
            <CartesianGrid strokeDasharray="3 3" />
            {renderXAxis("score")}
            <YAxis />
            <Tooltip />
            <Legend
              layout="vertical"
              align="center"
              verticalAlign="bottom"
              wrapperStyle={{ paddingLeft: 20, paddingTop: 20 }}
            />
            <Bar dataKey="frequency" fill="#82ca9d" barSize="100%" />
          </BarChart>
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

export default ChartModal;

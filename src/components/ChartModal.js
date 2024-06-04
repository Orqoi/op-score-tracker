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
} from "recharts";

const ChartModal = ({ open, handleClose, data }) => {
  const [selectedRankType, setSelectedRankType] = useState("ALL");

  const handleButtonClick = (rankType) => {
    setSelectedRankType(rankType);
  };

  const processData = (groupByKey) => {
    if (!data || data.length === 0) return [];
    const filteredData = data.filter((item) => item[groupByKey] !== null);
    const groupedData = filteredData.reduce((acc, item) => {
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

  const processWinLoseData = (groupByKey, result) => {
    if (!data) return [];
    const filteredData = data.filter(
      (item) => item.result === result && item[groupByKey] !== null,
    );
    const groupedData = filteredData.reduce((acc, item) => {
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

  const getChartData = (groupByKey) => {
    switch (selectedRankType) {
      case "WIN":
        return processWinLoseData(groupByKey, "WIN");
      case "LOSE":
        return processWinLoseData(groupByKey, "LOSE");
      default:
        return processData(groupByKey);
    }
  };

  const positionData = getChartData("position");
  const roleData = getChartData("role");
  const positionRoleData = getChartData(
    (item) => `${item.position}-${item.role}`,
  );

  const renderXAxis = (dataKey) => (
    <XAxis
      dataKey={dataKey}
      tick={{ fontSize: 11 }}
      interval={0}
      angle={-15}
      textAnchor="end"
      label={{ value: dataKey, position: "insideRight", offset: -10 }}
    />
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
      <DialogTitle>League of Legends OP Score Tracker</DialogTitle>
      <DialogContent>
        <Box display="flex" justifyContent="center" mb={4} mr={25}>
          <Button
            variant="contained"
            onClick={() => handleButtonClick("ALL")}
            sx={{ mx: 1 }}
          >
            ALL
          </Button>
          <Button
            variant="contained"
            onClick={() => handleButtonClick("WIN")}
            sx={{ mx: 1 }}
          >
            WIN
          </Button>
          <Button
            variant="contained"
            onClick={() => handleButtonClick("LOSE")}
            sx={{ mx: 1 }}
          >
            LOSE
          </Button>
        </Box>
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Position - Op_Rank Chart
          </Typography>
          <BarChart width={600} height={320} data={positionData}>
            <CartesianGrid strokeDasharray="3 3" />
            {renderXAxis("position")}
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="top"
              wrapperStyle={{ paddingLeft: 20, paddingTop: 20 }}
            />
            <Bar dataKey="rank" fill="#8884d8" />
          </BarChart>
        </Box>
        <Box mb={4} textAlign="center">
          <Typography variant="h6" component="h2" pr={25} gutterBottom sx={{ color: 'grey', fontStyle: 'italic' }}>
            Role - Op_Rank Chart
          </Typography>
          <BarChart width={600} height={320} data={roleData}>
            <CartesianGrid strokeDasharray="3 3" />
            {renderXAxis("role")}
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
            <Tooltip />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="top"
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

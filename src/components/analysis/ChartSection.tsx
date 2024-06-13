import React from "react";
import { Box, Typography } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ChartSectionProps {
  title: string;
  data: any;
  dataKey: string;
  color: string;
}

const ChartSection: React.FC<ChartSectionProps> = ({title, data, dataKey, color}) => {
  return (
    <Box ml={4} width="46%">
      <Typography color="#1976d2" variant="h6" gutterBottom>
        {title}
      </Typography>
      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-25} textAnchor="end" />
        <YAxis />
        <Tooltip />
        <Legend
          align="center"
          verticalAlign="bottom"
          wrapperStyle={{ paddingTop: 35 }}
        />
        <Bar dataKey={dataKey} fill={color} />
      </BarChart>
    </Box>
  );
};

export default ChartSection;

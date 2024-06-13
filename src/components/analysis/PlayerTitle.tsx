import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";

interface ChartSectionProps {
  labels: string[];
}

const labelToolTips: { [key: string]: string } = {
  'Value Fighter': 'Highest damage per gold',
  'Value Sandbag': 'Highest damage taken per death',
  'Objectives only': 'Highest damage to objectives',
  'Bin Laden': 'Highest damage to towers',
  'Doctor': 'Highest heal and shield',
};

const PlayerTitle: React.FC<ChartSectionProps> = ({ labels }) => {
  const labelColor = '#1976d2';
  
  return (
    <Box display="flex" alignItems="center" ml={1}>
      {labels.map((label, index) => (
        <Tooltip key={index} title={labelToolTips[label] || ''} arrow>
          <Box
            display="flex"
            alignItems="center"
            ml={1}
            borderRadius="2px"
            mt={0.5}
            height={'70%'}
            bgcolor={labelColor}
            p={0.5}
          >
            <Typography variant="body1" color='white' fontSize={'12px'}>
              {label}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default PlayerTitle;

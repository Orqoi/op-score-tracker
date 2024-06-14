import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";

interface ChartSectionProps {
  labels: string[];
}

const labelColor: { [key: string]: string } = {
  'Labour Force': '#3CBC8D',
  '50 Cent': '#3CBC8D',
  'Objectives': '#3CBC8D',
  'Bin Laden': '#3CBC8D',
  'Combat medic': '#3CBC8D',
  'Medusa' : '#3CBC8D',

  // reserved neural #f5cc52
  
  'Complacent' : '#d24638',
  'Turret Allergy': '#d24638',
  'Pigeon': '#d24638',
  'Blind' : '#d24638',
  'Might as well sleep' : '#d24638'
};

const labelIcon: { [key: string]: string } = {
  'Labour Force': '💪',
  '50 Cent': '🛡️',
  'Objectives': '🎯',
  'Bin Laden': '🏰',
  'Combat medic': '🚑',
  'Medusa' : '🐍',

  
  'Turret Allergy': '🚫',
  'Complacent' : '💀',
  'Pigeon': '🐦',

  // Downbad
  'Blind': '🙈',
  'Might as well sleep' : '😴'
};

const labelToolTips: { [key: string]: string } = {
  'Labour Force': 'Highest damage per gold',
  '50 Cent': 'Highest damage taken per death',
  'Objectives': 'Highest damage to objectives',
  'Bin Laden': 'Highest damage to towers',
  'Combat medic': 'Highest heal and shield',
  'Medusa' : 'Higest CC time',

  'Complacent' : 'Highest death with lowest damage taken per death',
  'Turret Allergy': 'Extremely low damage to turret',
  'Pigeon': 'Dude came here to make peace with the enemy, low kill part & damage proportion',
  'Blind' : 'Vision score below game average',
  'Might as well sleep' : 'Player approximate contribution in the team is < 12%, might as well sleep'
};

const PlayerTitle: React.FC<ChartSectionProps> = ({ labels }) => {
  

  return (
    <Box display="flex" alignItems="center" ml={1}>
      {labels.map((label, index) => (
        <Tooltip key={index} title={labelToolTips[label] || ''} arrow>
          <Box
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            m={1}
            borderRadius="10px"
            bgcolor={labelColor[label] || '#3CBC8D'}
            p={0.8}
          >
            <Typography variant="body1" color='white' fontSize={'11.5px'} fontWeight='bold'>
              {labelIcon[label] || ''} {label}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default PlayerTitle;

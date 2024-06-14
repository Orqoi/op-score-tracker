
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
  } from "@mui/material";
import { AnalysisStats } from "../../types";
import PlayerTitle from "./PlayerTitle";


const positionOrder = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT", "Unknown"];

const getImagePath = (championId: string): string => {
    try {
        return `champion_icons/${championId}.png`;
    } catch (error) {
        console.error(`Error loading image for championId ${championId}:`, error);
        return '';
    }
  };

const sortedPositionData = (data: AnalysisStats[]) => {
    return [...data].sort((a, b) => {
      const posA = a.position || "Unknown";
      const posB = b.position || "Unknown";
      return positionOrder.indexOf(posA) - positionOrder.indexOf(posB);
    });
  };

export const TeamTable: React.FC<{ data: AnalysisStats[], titles: { [key: string]: string}[], color: string }> = ({ data, titles, color }) => {

    return (
    <Box m={1} justifyContent="center">
        <TableContainer component={Paper}>
        <Table size="medium">
            <TableHead>
            <TableRow>
            <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff'  }}>Summoner Name</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff' }}>Titles</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff'  }}>Kda</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff'  }}>Minions</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff'  }}>Jungle</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff'  }}>Vision Score</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '16px', fontWeight: 'bold', backgroundColor: color, color: '#fff'  }}>Pink</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {sortedPositionData(data).map((item) => (
                <TableRow key={item.summonerName} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f1f1fa' }, fontSize: '14px', fontWeight: '500' }}>
                <TableCell align="left" sx={{ padding: '10px 15px', alignItems: 'center', fontSize: '14px', fontWeight: '600', fontFamily: 'revert'}}>
                    <Box display="flex">
                    <img src={getImagePath(item.championId)} alt={`Icon ${item.championId}`} width="32" height="32" style={{ marginRight: '8px' }} />
                    {item.summonerName}
                    </Box>
                </TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '14px', fontWeight: '500' }}>
                    <PlayerTitle labels={titles.filter(title => title.name === item.summonerName).map(title => title.label)} />
                </TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '14px', fontWeight: '500' }}>{`${item.baseStats.kill}/${item.baseStats.death}/${item.baseStats.assist}`}</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '14px', fontWeight: '500' }}>{item.baseStats.minion_kill}</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '14px', fontWeight: '500' }}>{item.baseStats.neutral_minion_kill}</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '14px', fontWeight: '500' }}>{item.baseStats.vision_score}</TableCell>
                <TableCell align="left" sx={{ padding: '10px 15px', fontSize: '14px', fontWeight: '500' }}>{item.baseStats.vision_wards_bought_in_game}</TableCell>
                </TableRow>
            ))}
    </TableBody>
  </Table>
</TableContainer>
</Box>);
}
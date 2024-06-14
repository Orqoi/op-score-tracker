
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs, Tab,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { AnalysisStats, Stats } from "../types";
import ChartSection from "./analysis/ChartSection";
import { TeamTable } from "./analysis/TeamTable";
type AnalysisModalProps = {
  open: boolean;
  handleClose: () => void;
  teamData: AnalysisStats[][];
  data: {[x:string]: {
    [x: string]: string | number;
    name: string;
}[]};
  titles: {[x:string]: string}[];
}

const AnalysisModal : React.FC<AnalysisModalProps> = ({ open, handleClose, teamData, data, titles }) => {
    const [selectedTab, setSelectedTab] = useState(0);
    const ownTeamData = teamData[0] ?? [];
    const enemyData = teamData[1] ?? [];
    // Sorted Stats Data
    const sortedDeathData = data?.sortedDeathData ?? [];
    const sortedGoldEarnedData = data?.sortedGoldEarnedData ?? [];
    const sortedCCData = data?.sortedCCData ?? [];
    const sortedObjectDamage = data?.sortedObjectDamage ?? [];
    const sortedTurretDamage = data?.sortedTurretDamage ?? [];
    const sortedHealAndShieldData = data?.sortedHealAndShieldData ?? [];
    const sortedDamagePerGoldData = data?.sortedDamagePerGoldData ?? [];
    const sortedDamagePerDeathData = data?.sortedDamagePerDeathData ?? [];

    const handleTabChange = (event:any, newValue:number) => {
        setSelectedTab(newValue);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
          <DialogTitle sx={{ color: '#1976d2', fontSize: 0, fontWeight: 'bold' }}>Analysis</DialogTitle>
          <DialogContent>
            <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label="Summary" sx={{ fontWeight: 'bold', fontSize: '17px' }} />
                <Tab label="Charts" sx={{ fontWeight: 'bold', fontSize: '17px' }} />
             </Tabs>
            {selectedTab === 0 && (
                <Box>
                    <Typography sx={{ color: '#1976d2', fontSize: 24, fontWeight: 'bold', mb:1 }}>Summary</Typography>
                    <TeamTable 
                    data={ownTeamData}
                    titles={titles}
                    color="#1976d2" 
                    />
                    <TeamTable 
                    data={enemyData}
                    titles={[]}
                    color="#e60000"
                    />
                </Box>
            )}
           
            {selectedTab === 1 && (
            <Box>
                <Typography sx={{ color: '#1976d2', fontSize: 24, fontWeight: 'bold', mb:2 }}>Charts</Typography>
                {/* Gold & damage per gold */}
                <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Gold Earned"
                    data={sortedGoldEarnedData ?? []}
                    dataKey="GoldEarned"
                    color="#8884d8"
                />
                <ChartSection
                    title="Damage Per Gold"
                    data={sortedDamagePerGoldData ?? []}
                    dataKey="DamagePerGold"
                    color="#82ca9d"
                />
                </Box>
                {/* death & damage taken per death */}
                <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Death"
                    data={sortedDeathData ?? []}
                    dataKey="Death"
                    color="#8884d8"
                />
                <ChartSection
                    title="Damage Taken Per Death"
                    data={sortedDamagePerDeathData ?? []}
                    dataKey="DamageTakenPerDeath"
                    color="#82ca9d"
                />
                </Box>
                {/* Heals-Shields & CC */}
                <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Heal & Shields"
                    data={sortedHealAndShieldData ?? []}
                    dataKey="HealnShield"
                    color="#8884d8"
                />
                <ChartSection
                    title="Total CC Time to Enemy"
                    data={sortedCCData ?? []}
                    dataKey="CcTime"
                    color="#82ca9d"
                />
                </Box>
                {/* Objectives damage & turret kill */}
                <Box display="flex" height="70%" justifyContent="space-between">
                <ChartSection
                    title="Damage Dealt to Objectives"
                    data={sortedObjectDamage ?? []}
                    dataKey="ObjectiveDamage"
                    color="#8884d8"
                />
                <ChartSection
                    title="Damage to Turret"
                    data={sortedTurretDamage ?? []}
                    dataKey="TurretDamage"
                    color="#82ca9d"
                />
                </Box>
            </Box>
            )}
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
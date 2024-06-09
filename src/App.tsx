import React, { useState } from "react";
import { getData } from "./utils";
import {
  Typography,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  type SelectChangeEvent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SelectInput from "./components/SelectInput";
import InputField from "./components/InputField";
import ChartModal from "./components/ChartModal";
import { gameModeOptions, numGamesOptions } from "./constants";
import type { GameMode, OpScoreTimelineStatistics, OpStatistic } from "./types";

function App() {
  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [result, setResult] = useState("");
  const [gameMode, setGameMode] = useState<GameMode>(gameModeOptions[0].value);
  const [numGames, setNumGames] = useState("20");
  const [recencyFilter, setRecencyFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openChart, setOpenChart] = useState(false);
  const [statistics, setStatistics] = useState<OpStatistic[]>([]);
  const [timeAverages, setTimeAverages] = useState<OpScoreTimelineStatistics[]>([]);

  
  const handleSearch = async () => {
    setError("");
    setLoading(true);
    const { opSummary, opStatistics, opTimeAverages, error } = await getData({ username, tag, recencyFilter, numGames: parseInt(numGames, 10), gameMode });
    if (error) {
      setError(error);
    } else if (opSummary && opStatistics && opTimeAverages) {
      setResult(opSummary);
      setStatistics(opStatistics);
      setTimeAverages(opTimeAverages);
    }
    setLoading(false);
  };

  const handleOpenChart = () => setOpenChart(true);
  const handleCloseChart = () => setOpenChart(false);

  return (
    <Box
      display="flex"
      width="100%"
      minHeight="100vh"
      flexDirection="column"
      alignItems="center"
      bgcolor="#4287f5"
    >
      <Typography
        align="center"
        mt={5}
        variant="h4"
        component="h1"
        color="#fcfcfc"
        fontWeight="bold"
      >
        League of Legends OP Score Tracker
      </Typography>
      <Box
        mt={15}
        borderRadius={3}
        padding={2}
        bgcolor="#fcfcfc"
        display="flex"
        flexDirection="column"
        boxShadow="0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 12px 40px 0 rgba(0, 0, 0, 0.19)"
        width={450}
        alignItems="center"
      >
        <Box display="flex" width="90%" alignItems="center">
          <InputField
            ml={2}
            pr={3}
            label="Summoner Name"
            placeholder="Summoner Name"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          />
          <InputField
            mr={2}
            label="Summoner Tag"
            value={tag}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTag(e.target.value)}
            display="flex"
            alignItems="center"
            flex={2}
            placeholder="#"
          />
        </Box>
        <SelectInput
          label="Mode"
          value={gameMode}
          onChange={(e: SelectChangeEvent<string>) => setGameMode(e.target.value as GameMode)}
          options={gameModeOptions}
        />

        <SelectInput
          label="Number of Games"
          value={numGames}
          onChange={(e: SelectChangeEvent<string>) => setNumGames(e.target.value)}
          options={numGamesOptions}
        />
        <Box pt={3} pb={3}>
          <FormControlLabel
            label="Restrict to latest session"
            control={
              <Checkbox
                checked={recencyFilter}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecencyFilter(e.target.checked)}
              />
            }
          />
        </Box>
        <Button
          variant="contained"
          size="large"
          color="primary"
          onClick={handleSearch}
          endIcon={<SearchIcon />}
        >
          Search
        </Button>
        <Typography
          variant="body1"
          style={{ whiteSpace: "pre-wrap" }}
          pt={3}
          pb={4}
          color="textPrimary"
        >
          {loading ? "Loading..." : error.length === 0 ? result : error}
        </Typography>
        {result && <Button
          variant="contained"
          size="large"
          color="secondary"
          onClick={handleOpenChart}
        >
          Open Charts
        </Button>}
      </Box>
      <ChartModal
        open={openChart}
        handleClose={handleCloseChart}
        data={statistics}
        timeAverages={timeAverages}
      />
    </Box>
  );
}

export default App;

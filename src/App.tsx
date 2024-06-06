import React, { useState } from "react";
import { getData, analyseLatestGame } from "./utils";
import {
  Typography,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SelectInput from "./components/SelectInput";
import InputField from "./components/InputField";
import ChartModal from "./components/ChartModal";
import { gameModeOptions, numGamesOptions } from "./constants";

function App() {
  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [result, setResult] = useState("");
  const [gameMode, setGameMode] = useState(gameModeOptions[0].value);
  const [numGames, setNumGames] = useState(20);
  const [recencyFilter, setRecencyFilter] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openChart, setOpenChart] = useState(false);
  const [statistics, setStatistics] = useState(null);

  
  const handleSearch = async () => {
    setLoading(true);
    //@ts-ignore
    const {op_summary, op_statistics } = await getData({ username, tag, recencyFilter, numGames, gameMode });
    setLoading(false);
    setResult(op_summary);
    setStatistics(op_statistics);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    //@ts-ignore
    const game_stats = await analyseLatestGame({ username, tag });
    setLoading(false);
  }

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
          {/*@ts-ignore*/}
          <InputField
            ml={2}
            pr={3}
            tag="Summoner Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputField
            mr={2}
            tag="Summoner Tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            display="flex"
            alignItems="center"
            flex={2}
            placeholder="#"
          />
        </Box>
        <SelectInput
          label="Mode"
          value={gameMode}
          onChange={(e) => setGameMode(e.target.value)}
          options={gameModeOptions}
        />
        <SelectInput
          label="Number of Games"
          value={numGames}
          onChange={(e) => setNumGames(e.target.value)}
          options={numGamesOptions}
        />
        <Box pt={3} pb={3}>
          <FormControlLabel
            label="Restrict to latest session"
            control={
              <Checkbox
                checked={recencyFilter}
                onChange={(e) => setRecencyFilter(e.target.checked)}
              />
            }
          />
        </Box>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={4}
        >
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={handleSearch}
            endIcon={<SearchIcon />}
          >
            Search
          </Button>
          <Tooltip title="Analyse your latest Game">
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={handleAnalyze}
              endIcon={<AnalyticsIcon />}
            >
              Analyse
            </Button>
          </Tooltip>
        </Box>
        <Typography
          variant="body1"
          style={{ whiteSpace: "pre-wrap" }}
          pt={3}
          pb={4}
          color="textPrimary"
        >
          {loading ? "Loading..." : result}
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
      />
    </Box>
  );
}

export default App;

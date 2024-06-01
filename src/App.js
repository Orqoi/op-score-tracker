import React, { useState } from "react";
import { getData } from "./utils";
import {
  Typography,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SelectInput from "./components/SelectInput";
import InputField from "./components/InputField";
import ChartModal from "./components/ChartModal";

function App() {
  const [username, setUsername] = useState("");
  const [tag, setTag] = useState("");
  const [mode, setMode] = useState("ALL");
  const [counts, setCounts] = useState("20");
  const [recencyFilter, setRecencyFilter] = useState(false);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [openChart, setOpenChart] = useState(false);
  const [statistics, setStatistics] = useState(null);

  const modeOptions = [
    { value: "ALL", label: "ALL" },
    { value: "ARAM", label: "ARAM" },
    { value: "NORMALS", label: "NORMS & RANK" },
  ];
  const countOptions = [
    { value: "20", label: "20" },
    { value: "40", label: "40" },
    { value: "60", label: "60" },
    { value: "80", label: "80" },
    { value: "100", label: "100" },
  ];
  const handleSearch = async () => {
    setLoading(true);
    const data = await getData({ username, tag, recencyFilter, counts, mode });
    setLoading(false);
    setResult(data.op_summary);
    setStatistics(data.op_statistics);
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
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          options={modeOptions}
        />
        <SelectInput
          label="Number of Games"
          value={counts}
          onChange={(e) => setCounts(e.target.value)}
          options={countOptions}
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
          {loading ? "Loading..." : result}
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          onClick={handleOpenChart}
        >
          Open Charts
        </Button>
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

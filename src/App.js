import React, { useState } from 'react';
import { getData } from './utils';
import { Input, Typography, InputLabel, Button, Box, Checkbox, FormControlLabel, MenuItem, FormControl, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import TagIcon from '@mui/icons-material/Tag';


function App() {
    const [username, setUsername] = useState('');
    const [tag, setTag] = useState('');
    const [mode, setMode] = useState('ALL');
    const [counts, setCounts] = useState('20'); 
    const [recencyFilter, setRecencyFilter] = useState(false);
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
      setLoading(true);
      const data = await getData({username, tag, recencyFilter, counts, mode})
      setLoading(false);
      setResult(data)
    }
  

    return (
        <Box display="flex" width="100%" minHeight="100vh" flexDirection="column" alignItems="center" bgcolor="#4287f5">
          <Typography align='center' mt={5} variant="h4" component="h1" color="#fcfcfc" fontWeight="bold">
            League of Legends OP Score Tracker
          </Typography>
          <Box mt={15} borderRadius={3} bgcolor="#fcfcfc" display="flex" flexDirection="column" boxShadow="0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 12px 40px 0 rgba(0, 0, 0, 0.19)" width={400} alignItems="center">
            <Box pt={4} maxWidth={250}>
              <InputLabel>Summoner Name</InputLabel>
              <Input startAdornment={<PersonIcon/>} type='text' value={username} onChange={e => setUsername(e.target.value)}/>
            </Box>
            <Box pt={3} maxWidth={250}>
              <InputLabel>Summoner Tag</InputLabel>
              <Input type="text" value={tag} onChange={e => setTag(e.target.value)} startAdornment={<TagIcon/>}/>
            </Box>
            <Box pt={3} minWidth={225}>
                <FormControl fullWidth>
                <InputLabel id="mode-select-label">Select Mode</InputLabel>
                <Select
                    labelId="mode-select-label"
                    id="mode-select"
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                >
                    <MenuItem value="">
                    <em>None</em>
                    </MenuItem>
                    <MenuItem value="ALL">ALL</MenuItem>
                    <MenuItem value="ARAM">ARAM</MenuItem>
                    <MenuItem value="NORMALS">NORMS & RANK</MenuItem>
                </Select>
                </FormControl>
            </Box>
            <Box pt={3} minWidth={225}>
                <FormControl fullWidth>
                <InputLabel id="mode-select-label">Select Game Number</InputLabel>
                <Select
                    labelId="mode-select-label"
                    id="count-select"
                    value={counts}
                    onChange={e => setCounts(e.target.value)}
                >
                    <MenuItem value="">
                    <em>None</em>
                    </MenuItem>
                    <MenuItem value="20">20</MenuItem>
                    <MenuItem value="40">40</MenuItem>
                    <MenuItem value="60">60</MenuItem>
                    <MenuItem value="80">80</MenuItem>
                    <MenuItem value="100">100</MenuItem>
                </Select>
                </FormControl>
            </Box>
            <Box pt={3} pb={3}>
              <FormControlLabel label="Restrict to latest session" control={<Checkbox checked={recencyFilter} onChange={e => setRecencyFilter(e.target.checked)} />}/>
            </Box>
            <Button variant="contained" size="large" color="primary" onClick={handleSearch} endIcon={<SearchIcon />}>Search</Button>
            <Box borderRadius={3} bgcolor="#fcfcfc" display="flex" flexDirection="column" boxShadow="0 8px 16px 0 rgba(0, 0, 0, 0.2), 0 12px 40px 0 rgba(0, 0, 0, 0.19)" alignItems="center">
                <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}  pt={3} pb={4} color='textPrimary'>{loading ? 'Loading...' : result}</Typography>
            </Box>
          </Box>
        </Box>
    );
}

export default App;

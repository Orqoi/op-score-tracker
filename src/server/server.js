const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

app.get('/summoner/:username/:tag', async (req, res) => {
    const { username, tag } = req.params;
    const getSummonerIdUrl = `https://www.op.gg/summoners/sg/${username}-${tag}`;
    try {
        const response = await axios.get(getSummonerIdUrl);
        const scriptTag = response.data.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
        if (scriptTag) {
            const data = JSON.parse(scriptTag[1]);
            const summonerId = data.props.pageProps.data.summoner_id;
            res.json({ summonerId });
        } else {
            res.status(404).json({ error: 'User does not exist' });
        }
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'An error occurred' });
    }
});

app.post('/summoner/:summonerId/renewal', async (req, res) => {
    const { summonerId } = req.params;
    const renewalUrl = `https://lol-web-api.op.gg/api/v1.0/internal/bypass/summoners/sg/${summonerId}/renewal`;
    try {
        await axios.post(renewalUrl);
        res.status(200).json({ message: 'Renewal successful' });
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'An error occurred' });
    }
});

app.get('/matches/:summonerId', async (req, res) => {
    const { summonerId } = req.params;
    const matchHistoryUrl = `https://lol-web-api.op.gg/api/v1.0/internal/bypass/games/sg/summoners/${summonerId}?&limit=20&hl=en_US`;
    try {
        const matchHistoryResponse = await axios.get(matchHistoryUrl);
        const games = matchHistoryResponse.data.data;
        res.json(games);
    } catch (error) {
        res.status(error.response?.status || 500).json({ error: 'An error occurred' });
    }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`);
});

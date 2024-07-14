const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SONOS_API_KEY = process.env.SONOS_API_KEY;
const SONOS_DEVICE_ID = process.env.SONOS_DEVICE_ID;

app.post('/command', async (req, res) => {
    const userCommand = req.body.command;

    try {
        const chatgptResponse = await axios.post('https://api.openai.com/v1/completions', {
            model: "text-davinci-003",
            prompt: `Translate this command into a Sonos API request: ${userCommand}`,
            max_tokens: 50
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        const sonosCommand = chatgptResponse.data.choices[0].text.trim();
        const sonosResponse = await axios.post(`https://api.sonos.com/control/api/v1/players/${SONOS_DEVICE_ID}/playback`, {
            command: sonosCommand
        }, {
            headers: {
                'Authorization': `Bearer ${SONOS_API_KEY}`
            }
        });

        res.json({ message: 'Command sent to Sonos successfully', sonosResponse: sonosResponse.data });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process command' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


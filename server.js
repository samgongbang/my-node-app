const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Lotto API Proxy Endpoint
app.get('/api/lotto/:round', async (req, res) => {
  const round = req.params.round;
  const lottoApiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

  try {
    const response = await axios.get(lottoApiUrl);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
    res.status(500).json({ error: 'Failed to fetch lotto data' });
  }
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});

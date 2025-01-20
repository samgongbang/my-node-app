const express = require('express');
const axios = require('axios');
const app = express();

app.get('/api/lotto/:round', async (req, res) => {
  const round = req.params.round;
  try {
    const response = await axios.get(
      `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
    res.status(500).json({ error: 'Failed to fetch lotto data' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

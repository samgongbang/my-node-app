const express = require('express');
const axios = require('axios');
const app = express();

// 동행복권 API를 호출하는 엔드포인트
app.get('/api/lotto/:round', async (req, res) => {
  const round = req.params.round; // 클라이언트로부터 받은 회차 번호
  const targetUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

  try {
    const response = await axios.get(targetUrl);
    res.json(response.data); // 동행복권 API 데이터를 클라이언트에 반환
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
    res.status(500).json({ error: 'Failed to fetch lotto data' });
  }
});

// Render에서 제공하는 PORT로 서버 실행
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

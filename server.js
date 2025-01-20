const express = require('express');
const axios = require('axios');
const app = express();

// 동행복권 API 요청을 처리하는 프록시 엔드포인트
app.get('/api/lotto/:round', async (req, res) => {
  const round = req.params.round; // 요청받은 회차 번호
  try {
    // 동행복권 API에 요청
    const response = await axios.get(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`);
    res.json(response.data); // 응답 데이터를 클라이언트로 전달
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
    res.status(500).json({ error: 'Failed to fetch lotto data' });
  }
});

// 서버가 Render에서 제공하는 PORT 환경 변수로 실행되도록 설정
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

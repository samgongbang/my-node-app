const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 캐시 유효 시간: 1시간

// Middleware
app.use(cors());
app.use(express.json());

// 요청 제한 설정 (분당 10회)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1분
  max: 10, // 분당 최대 10회 요청 허용
  message: 'Too many requests. Please try again later.',
});

// Lotto API Proxy Endpoint
app.get('/api/lotto/:round', apiLimiter, async (req, res) => {
  const round = req.params.round;

  // 캐시 확인
  if (cache.has(round)) {
    console.log(`Cache hit for round ${round}`);
    return res.json(cache.get(round));
  }

  const lottoApiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

  try {
    const response = await axios.get(lottoApiUrl);
    const data = response.data;

    // 캐시에 데이터 저장
    cache.set(round, data);

    console.log(`Cache set for round ${round}`);
    res.json(data);
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
    res.status(500).json({ error: 'Failed to fetch lotto data' });
  }
});

// Server Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

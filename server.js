const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

const app = express();
const cache = new NodeCache({ stdTTL: 7 * 24 * 60 * 60 }); // 캐시 유효 시간: 1주일
let currentData = null; // 현재 저장된 데이터

// trust proxy 설정
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// 요청 제한 설정 (분당 50회)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
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

  // 캐시에 없으면 API 호출
  const lottoApiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

  try {
    const response = await axios.get(lottoApiUrl);
    const data = response.data;

    // 데이터 저장 및 초기화
    currentData = data;
    cache.set(round, data);

    console.log(`Initial data fetched and cached for round ${round}`);
    return res.json(data);
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
    return res.status(500).json({ error: 'Failed to fetch lotto data' });
  }
});

// Lotto 데이터 업데이트 함수
const fetchAndUpdateLottoData = async (round) => {
  const lottoApiUrl = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`;

  try {
    const response = await axios.get(lottoApiUrl);
    const newData = response.data;

    if (!currentData || JSON.stringify(currentData) !== JSON.stringify(newData)) {
      console.log(`Data updated for round ${round}`);
      currentData = newData;
      cache.set(round, newData);
    } else {
      console.log(`No change detected for round ${round}`);
    }
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
  }
};

// 최신 회차 계산 함수
const getLatestRound = () => {
  const startDate = new Date(2002, 11, 7); // 2002년 12월 7일 (1회차)
  const now = new Date();
  const diffWeeks = Math.floor((now - startDate) / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
};

// 스케줄러 설정 (매주 토요일 20:45~21:05, 30초 간격 실행)
const scheduleDataUpdate = () => {
  const now = new Date();
  
  // 다음 토요일 20:45 (오후 8시 45분) 계산
  let nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7));
  nextSaturday.setHours(20, 45, 0, 0);
  
  if (now > nextSaturday) {
    nextSaturday.setDate(nextSaturday.getDate() + 7);
  }

  const millisUntilStart = nextSaturday - now;
  
  setTimeout(() => {
    console.log('Lotto data update scheduler started.');
    const round = getLatestRound();

    // 30초마다 실행 (8:45 ~ 9:05)
    const interval = setInterval(() => {
      const currentTime = new Date();
      if (currentTime.getHours() === 21 && currentTime.getMinutes() >= 5) {
        console.log('Lotto data update scheduler stopped.');
        clearInterval(interval);
        return;
      }
      console.log(`Fetching lotto data for round ${round} at ${currentTime}`);
      fetchAndUpdateLottoData(round);
    }, 30 * 1000);

    // 다음 주 스케줄 설정
    scheduleDataUpdate();
  }, millisUntilStart);
};

// 서버 시작 시 초기 데이터 불러오기
const initializeData = async () => {
  const round = getLatestRound();
  console.log(`Initializing data for round ${round}`);
  await fetchAndUpdateLottoData(round);
};

// 서버 시작 시 초기화 및 스케줄링 실행
initializeData();
scheduleDataUpdate();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

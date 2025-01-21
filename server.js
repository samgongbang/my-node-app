const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');
const rateLimit = require('express-rate-limit');

const app = express();
const cache = new NodeCache({ stdTTL: 7 * 24 * 60 * 60 }); // 캐시 유효 시간: 1주일
let currentData = null; // 현재 저장된 데이터

// trust proxy 설정
app.set('trust proxy', 1); // 첫 번째 프록시를 신뢰하도록 설정

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

    // 데이터 변경 여부 확인
    if (!currentData || JSON.stringify(currentData) !== JSON.stringify(newData)) {
      console.log(`Data updated for round ${round}`);
      currentData = newData; // 현재 데이터를 업데이트
      cache.set(round, newData); // 캐시에 데이터 저장
    } else {
      console.log(`No change detected for round ${round}`);
    }
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
  }
};

// 최신 회차 계산 함수
const getLatestRound = () => {
  const now = new Date();
  const baseYear = 2002; // 로또 시작 연도
  const yearDiff = now.getFullYear() - baseYear;
  const weekOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return yearDiff * 52 + weekOfYear;
};

// 스케줄러 설정 (매주 토요일 오후 9시에 실행)
const scheduleDataUpdate = () => {
  const now = new Date();
  const millisUntilNextSaturday9PM = (() => {
    const nextSaturday = new Date(now);
    nextSaturday.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7)); // 다음 토요일 계산
    nextSaturday.setHours(21, 0, 0, 0); // 오후 9시 설정
    return nextSaturday - now;
  })();

  setTimeout(() => {
    const round = getLatestRound();
    console.log(`Fetching lotto data for round ${round}`);
    fetchAndUpdateLottoData(round);
    scheduleDataUpdate(); // 다음 주 스케줄 설정
  }, millisUntilNextSaturday9PM);
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

/**
 * 클라이언트 측 캐싱 로직 예제 (사용할 클라이언트 측 코드)
 */

// 클라이언트 캐싱 함수
async function fetchLottoData(round) {
  const cachedData = localStorage.getItem(`lotto-round-${round}`);
  if (cachedData) {
    console.log('Using cached data from localStorage');
    return JSON.parse(cachedData);
  }

  try {
    const response = await fetch(`http://localhost:3000/api/lotto/${round}`);
    const data = await response.json();
    localStorage.setItem(`lotto-round-${round}`, JSON.stringify(data)); // 로컬 스토리지에 저장
    console.log('Fetched data from server and cached locally');
    return data;
  } catch (error) {
    console.error('Error fetching lotto data:', error);
  }
}

// 클라이언트에서 데이터 표시
async function displayLottoData(round) {
  const data = await fetchLottoData(round);
  if (data) {
    document.getElementById('lotto-results').innerText = JSON.stringify(data, null, 2);
  }
}

// 호출 예제
const latestRound = getLatestRound(); // 최신 회차 계산
window.onload = () => displayLottoData(latestRound);

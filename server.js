const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 캐시 유효 시간: 1시간
const LOTTO_API_URL = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';

app.use(cors());
app.use(express.json());

// 캐시에 저장된 결과값 반환
app.get('/api/lotto/:round', (req, res) => {
  const round = req.params.round;

  if (cache.has(round)) {
    console.log(`Cache hit for round ${round}`);
    return res.json(cache.get(round));
  } else {
    return res.status(404).json({ error: 'No data available. Please wait for the next update.' });
  }
});

// 결과값 변경 감지 및 캐시 업데이트
const monitorLottoResult = async () => {
  const round = await getLatestRound(); // 최신 회차 번호를 계산 (구현 필요)

  try {
    const response = await axios.get(`${LOTTO_API_URL}${round}`);
    const newData = response.data;

    if (!cache.has(round) || JSON.stringify(cache.get(round)) !== JSON.stringify(newData)) {
      console.log(`Data updated for round ${round}`);
      cache.set(round, newData);
    } else {
      console.log(`No change detected for round ${round}`);
    }
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
  }
};

// 최신 회차를 계산하는 함수 (연도와 주차 기준)
const getLatestRound = async () => {
  const now = new Date();
  const baseYear = 2002; // 로또 시작 연도
  const yearDiff = now.getFullYear() - baseYear;
  const weekOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return yearDiff * 52 + weekOfYear; // 대략적인 회차 계산
};

// 토요일 오후 9시 이후 결과 감지 스케줄링
const scheduleMonitoring = () => {
  const now = new Date();
  const isSaturday = now.getDay() === 6;
  const isEvening = now.getHours() >= 21 && now.getHours() < 22;

  if (isSaturday && isEvening) {
    console.log('Starting monitoring for lotto result...');
    setInterval(monitorLottoResult, 5000); // 5초 간격으로 데이터 확인
  } else {
    console.log('Outside monitoring hours.');
  }
};

// 서버 시작 시 스케줄링 실행
scheduleMonitoring();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

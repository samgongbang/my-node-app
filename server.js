const express = require('express');
const axios = require('axios');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 3600 }); // 캐시 유효 시간: 1시간
const LOTTO_API_URL = 'https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=';
let currentData = null; // 현재 표시할 데이터
let isDataChanged = false; // 데이터 변경 여부

app.use(cors());
app.use(express.json());

// 클라이언트 요청 처리
app.get('/api/lotto/:round', (req, res) => {
  const round = req.params.round;

  if (currentData) {
    console.log(`Returning cached data for round ${round}`);
    return res.json({ data: currentData, isChanged: isDataChanged });
  } else {
    return res.status(404).json({ error: 'No data available. Please wait for the next update.' });
  }
});

// API 호출 및 변경 여부 확인
const fetchDataAndUpdate = async (round) => {
  try {
    const response = await axios.get(`${LOTTO_API_URL}${round}`);
    const newData = response.data;

    // 데이터 변경 여부 확인
    if (!currentData || JSON.stringify(currentData) !== JSON.stringify(newData)) {
      console.log(`Data updated for round ${round}`);
      currentData = newData; // 데이터 업데이트
      isDataChanged = true; // 데이터 변경 플래그 설정
    } else {
      console.log(`No change detected for round ${round}`);
      isDataChanged = false; // 데이터 변경 없음
    }

    // 캐시에 데이터 저장
    cache.set(round, currentData);
  } catch (error) {
    console.error('Error fetching lotto data:', error.message);
  }
};

// 최신 회차 계산
const getLatestRound = () => {
  const now = new Date();
  const baseYear = 2002; // 로또 시작 연도
  const yearDiff = now.getFullYear() - baseYear;
  const weekOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  return yearDiff * 52 + weekOfYear;
};

// 토요일 오후 9시부터 데이터 확인
const monitorLottoResult = () => {
  const now = new Date();
  const isSaturday = now.getDay() === 6;
  const isEvening = now.getHours() >= 21 && now.getHours() < 22;

  if (isSaturday && isEvening) {
    const round = getLatestRound();
    console.log(`Checking lotto result for round ${round}`);
    fetchDataAndUpdate(round);
  }
};

// 주기적으로 확인 (5초 간격)
setInterval(monitorLottoResult, 5000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

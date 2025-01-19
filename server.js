const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// API 엔드포인트
app.get('/api/lotto/:round', async (req, res) => {
    const round = req.params.round; // URL에서 회차 추출
    try {
        const response = await axios.get(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`);
        res.json(response.data); // 동행복권 API 응답 데이터를 반환
    } catch (error) {
        console.error('Error fetching lotto data:', error.message);
        res.status(500).json({ error: 'Failed to fetch lotto data' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


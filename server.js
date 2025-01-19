const express = require('express');
const axios = require('axios'); // HTTP 요청을 위한 Axios 라이브러리
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// 동행복권 API 프록시 엔드포인트
app.get('/api/lotto/:round', async (req, res) => {
    const round = req.params.round;

    try {
        const response = await axios.get(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`);
        res.json(response.data); // API 응답을 클라이언트로 전달
    } catch (error) {
        console.error('Error fetching lotto data:', error.message);
        res.status(500).json({ error: 'Failed to fetch lotto data' });
    }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require('express');
const app = express();

// 기본 경로 처리
app.get('/', (req, res) => {
    res.send('Welcome to the Lotto API! Use /api/lotto/:round to fetch lotto data.');
});

// 기타 API 경로
app.get('/api/lotto/:round', async (req, res) => {
    const round = req.params.round;
    try {
        const response = await axios.get(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching lotto data:', error.message);
        res.status(500).json({ error: 'Failed to fetch lotto data' });
    }
});

// Render에서 지정한 포트 사용
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

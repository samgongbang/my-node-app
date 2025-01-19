import express from 'express';
import * as cheerio from 'cheerio';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/lotto/:round', async (req, res) => {
    const round = req.params.round;
    try {
        const response = await axios.get(`https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${round}`);
        const $ = cheerio.load(response.data);
        // 필요한 데이터 처리 로직 작성
        res.json({ message: 'Lotto data processed!' });
    } catch (error) {
        console.error('Error fetching lotto data:', error.message);
        res.status(500).json({ error: 'Failed to fetch lotto data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

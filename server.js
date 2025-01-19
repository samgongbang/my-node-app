const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();

app.get("/fetch-title", async (req, res) => {
    try {
        const { data } = await axios.get("https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1155");
        const $ = cheerio.load(data);

        // 페이지에서 모든 <title> 태그 가져오기
        const titles = $("title").map((_, el) => $(el).text()).get();

        res.json({
            success: true,
            titles,
        });
    } catch (error) {
        console.error("Error fetching titles:", error);
        res.status(500).json({ success: false, error: "Failed to fetch titles" });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});




const axios = require('axios');

async function testLottoAPI() {
    try {
        const response = await axios.get('https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1155');
        console.log(response.data); // 동행복권 API 응답 확인
    } catch (error) {
        console.error('API 호출 실패:', error.message);
    }
}

testLottoAPI();



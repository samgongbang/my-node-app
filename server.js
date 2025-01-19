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

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

const express = require("express");
const fetch = require("node-fetch");

const app = express();

// 프록시 엔드포인트 설정
app.get("/api/lotto", async (req, res) => {
    const apiUrl = "https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1155";
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching lotto numbers:", error);
        res.status(500).json({ error: "Failed to fetch lotto numbers" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
});

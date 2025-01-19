import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();

app.get('/lotto', async (req, res) => {
    try {
        // 동행복권 페이지 요청
        const response = await axios.get('https://www.dhlottery.co.kr/gameResult.do?method=byWin');
        const $ = cheerio.load(response.data);

        // 당첨 번호 추출
        const winningNumbers = [];
        $('.nums .ball_645').each((index, element) => {
            winningNumbers.push($(element).text());
        });

        const bonusNumber = $('.bonus .ball_645').text();

        // HTML 생성 및 응답
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>로또 당첨 번호</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
                    .numbers { margin-top: 20px; font-size: 24px; }
                    .number-circle { display: inline-flex; justify-content: center; align-items: center; 
                        width: 40px; height: 40px; margin: 5px; border-radius: 50%; font-size: 20px; color: white; 
                        font-weight: bold; background-color: orange; }
                    .bonus { background-color: gray; }
                </style>
            </head>
            <body>
                <h1>로또 당첨 번호</h1>
                <div class="numbers">
                    ${winningNumbers.map(num => `<span class="number-circle">${num}</span>`).join('')}
                    <span class="number-circle bonus">${bonusNumber}</span>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error fetching lotto numbers:', error);
        res.status(500).send('로또 번호를 가져오는 중 오류가 발생했습니다.');
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

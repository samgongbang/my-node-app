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

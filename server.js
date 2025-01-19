const axiosInstance = axios.create({
    timeout: 10000, // 10초
});

async function testLottoAPI() {
    try {
        const response = await axiosInstance.get('https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=1155');
        console.log(response.data);
    } catch (error) {
        console.error('API 호출 실패:', error.message);
    }
}

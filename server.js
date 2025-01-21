async function fetchLottoData(round) {
  const cachedData = localStorage.getItem(`lotto-round-${round}`);
  if (cachedData) {
    console.log('Using cached data from localStorage');
    return JSON.parse(cachedData);
  }

  try {
    const response = await fetch(`http://localhost:3000/api/lotto/${round}`);
    const result = await response.json();

    if (result.cached) {
      console.log('Data retrieved from server cache');
    } else {
      console.log('Data fetched from API and cached');
    }

    localStorage.setItem(`lotto-round-${round}`, JSON.stringify(result.data));
    return result.data;
  } catch (error) {
    console.error('Error fetching lotto data:', error);
  }
}

async function displayLottoData(round) {
  const data = await fetchLottoData(round);
  if (data) {
    document.getElementById('lotto-results').innerText = JSON.stringify(data, null, 2);
  }
}

const latestRound = new Date().getFullYear() - 2002 + 1; // 대략적인 회차 계산
window.onload = () => displayLottoData(latestRound);

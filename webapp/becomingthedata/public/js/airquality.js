var correct = false;

// get aqi from api call
async function fetchAirQuality() {
    try {
        const response = await fetch('/api/airquality');
        const airQualityData = await response.json();
        return airQualityData.data.aqi;
    } catch (error) {
        console.error('Error fetching air quality data:', error);
        return null;
    }
}

// check the user's guess
async function check() {
    document.getElementById('aqiguess').style.display = 'none';
    document.getElementById('btnguess').style.display = 'none';

    const userGuess = parseInt(document.getElementById('aqiguess').value);
    const realAQI = currentAQI;
    const withinRange = Math.abs(userGuess - realAQI) <= 2;

    if (withinRange) {
        correct = true;
    }

    const resultText = withinRange ? '<p id="aqiresult" style= "color: var(--grass-green)">Correct!</p>' : '<p id="aqiresult" style= "color: var(--fall-orange)">Incorrect!</p>';
    const realAQIText = `The current real AQI in Atlanta is:`;
    const resultElement = document.createElement('div');
    resultElement.classList.add('aqiresults');
    resultElement.innerHTML = `${resultText}<h2>${realAQIText}</h2><p class="aqi">${realAQI}</p>`;
    document.querySelector('.question').appendChild(resultElement);

    // scroll
    const resultsSection = document.getElementById('aqiresult');
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// fetch air quality data on page load and store it in a variable
let currentAQI = -1;
fetchAirQuality().then(aqi => {
    currentAQI = aqi;
});
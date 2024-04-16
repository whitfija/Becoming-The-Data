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
    resultElement.innerHTML = `${resultText}<h2>${realAQIText}</h2><p class="aqi">${realAQI}</p><p>(According to <a href="https://waqi.info/">waqi.info</a>)</p>`;
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

// slider stuff

let slider = document.querySelector('input[type="range"][hidden]');
let baseNotches = [...document.querySelectorAll(".base-notch")];
let knob = document.querySelector(".knob");
let knobShadow = document.querySelector(".knob-shadow");
let knobNotch = document.querySelector(".knob-notch");
let value = document.querySelector(".value");

function knobTouchHandler(e) {
    e.preventDefault();
    let { top, left, width, height } = knob.closest('.base').getBoundingClientRect();
    let containerRect = knob.closest('.base').getBoundingClientRect();
    let containerTop = containerRect.top + window.scrollY;
    let containerLeft = containerRect.left + window.scrollX;

    //console.log(width + 'width')
    //console.log(height + 'height')

    let y = top + height / 2;
    let x = left + width / 2;
    
    function tracker(e) {
        let pointerY;
        let pointerX;
        if (['mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave'].includes(e.type)) {
        pointerY = e.pageY - containerTop;
        pointerX = e.pageX - containerLeft;
        } else if (['touchstart', 'touchmove', 'touchend', 'touchcancel'].includes(e.type)) {
        let evt = (typeof e.originalEvent === 'undefined') ? e : e.originalEvent;
        let touch = evt.touches[0] || evt.changedTouches[0];
        pointerY = touch.pageY - containerTop;
        pointerX = touch.pageX - containerLeft;
        }

        pointerY *= 5;
        pointerX *= 5;
        //console.log('point: ' + pointerX + ',' + pointerY)
        //console.log('pos: ' + x + ',' + y)
        
        let rad = Math.atan2(pointerY - y, pointerX - x);
        if (rad < 0) {
        rad = 2 * Math.PI + rad;
        }
        //console.log(rad + ' rad')
        let deg = 180 * rad / Math.PI - 135;
        //console.log(deg + ' deg')
        if (deg > -135 && deg < -90) {
        deg = 225 + (135 + deg);
        }
        if (deg < 0) {
        if (deg < -45) {
            deg = 270;
        } else {
            deg = 0;
        }
        }
        slider.value = deg / 270 * (slider.max - slider.min) + slider.min;
        knob.style.transform = `rotate(${deg - 135}deg)`;
        updateComponentState();
    }
    
    document.addEventListener("mousemove", tracker);
    document.addEventListener("touchmove", tracker);
    document.addEventListener("touchmove", preventScroll, { passive: false });
    
    function preventScroll(e) {
        e.preventDefault();
    }

    function eventRemover() {
        document.removeEventListener("mousemove", tracker);
        document.removeEventListener("touchmove", tracker);
        document.removeEventListener("touchmove", preventScroll);
    }

    document.addEventListener("mouseup", eventRemover);
    document.addEventListener("touchend", eventRemover);
}

knobShadow.addEventListener("mousedown", knobTouchHandler);
knobShadow.addEventListener("touchstart", knobTouchHandler);

function updateComponentState() {
    knob.style.transform = `rotate(${(270 * (slider.value / 5)) / 100 - 135}deg)`;
    value.textContent = slider.value;

    let aqi = parseInt(slider.value); // get AQI value from the slider
    let aqiCategory, textColor;
    let categoryText = document.getElementById('aqisection')

    if (aqi >= 0 && aqi <= 50) {
        aqiCategory = "Good";
        textColor = "var(--grass-green)";
    } else if (aqi >= 51 && aqi <= 100) {
        aqiCategory = "Moderate";
        textColor = "var(--sunshine-yellow)";
    } else if (aqi >= 101 && aqi <= 150) {
        aqiCategory = "Unhealthy for Sensitive Groups";
        textColor = "var(--georgia-peach)";
    } else if (aqi >= 151 && aqi <= 200) {
        aqiCategory = "Unhealthy";
        textColor = "var(--fall-orange)";
    } else if (aqi >= 201 && aqi <= 300) {
        aqiCategory = "Very Unhealthy";
        textColor = "var(--red-clay)";
    } else if (aqi >= 301 && aqi <= 500) {
        aqiCategory = "Hazardous";
        textColor = "#841cbc";
    }
    //console.log(aqiCategory)
    categoryText.innerHTML = aqiCategory
    categoryText.style.color = textColor


    if (+slider.value > +slider.min) {
        knob.classList.add("knob-active");
        knobNotch.classList.add("notch-active");
        value.classList.add("value-active");
        knobNotch.style.backgroundColor = textColor;
    } else {
        knob.classList.remove("knob-active");
        knobNotch.classList.remove("notch-active");
        value.classList.remove("value-active");
        knobNotch.style.backgroundColor = ''
    }
    baseNotches.forEach((notch, index) => {
        if ((slider.value - slider.min) / ((slider.max - slider.min) - 1) > index / (baseNotches.length - 1)) {
        notch.classList.add("notch-active");
        notch.style.backgroundColor = textColor;
        } else {
        notch.style.backgroundColor = ''
        notch.classList.remove("notch-active");
        }
    });

    // update value text color
    value.style.color = textColor;
}
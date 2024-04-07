var canvas = document.getElementById('fishCanvas')
var ctx = canvas.getContext('2d');

// last known position
var pos = { x: 0, y: 0 };

canvas.addEventListener('touchstart', handleStart, false);
canvas.addEventListener('touchmove', handleMove, false);
canvas.addEventListener('touchend', handleEnd, false);

function handleStart(e) {
  e.preventDefault();
  setPosition(e.touches[0]);
}

function handleMove(e) {
  e.preventDefault(); 
  draw(e.touches[0]);
}

function handleEnd(e) {
  e.preventDefault();
  pos = { x: 0, y: 0 };
}

canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseenter', setPosition);
canvas.addEventListener('mouseup', handleEnd);

// new position from mouse event
function setPosition(e) {
    var rect = canvas.getBoundingClientRect();
    if (e.type === 'touchstart' || e.type === 'touchmove') {
        pos.x = e.touches[0].clientX - rect.left;
        pos.y = e.touches[0].clientY - rect.top;
    } else {
        pos.x = e.clientX - rect.left;
        pos.y = e.clientY - rect.top;
    }

    console.log(pos.x + ',' + pos.y)
}

function draw(e) {
    console.log(e.buttons)
    if (e.buttons === 1 ) {
        e.preventDefault();
    }

    if (e.buttons === 0 ) {
        return;
    }
    
    ctx.beginPath(); // Begin path

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#7F3206';

    ctx.moveTo(pos.x, pos.y); // From
    setPosition(e);
    ctx.lineTo(pos.x, pos.y); // To

    ctx.stroke(); // Draw stroke
}

function saveFish() {
    var canvas = document.getElementById('fishCanvas');
    var fishName = document.getElementById('fishName').value.trim();

    // data URL representing the canvas content
    var canvasDataURL = canvas.toDataURL('image/png');
    var fishData = {
        name: fishName,
        canvas: canvasDataURL
    };

    submitSurveyResponse('oceans', fishData);
}
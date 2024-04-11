// reliability slider
var reliableSlider = document.getElementById("rangeReliable");
var reliableOutput = document.getElementById("outputReliable");
reliableOutput.innerHTML = reliableSlider.value;
reliableSlider.oninput = function() {
    reliableOutput.innerHTML = this.value;
}

// money slider
var moneySlider = document.getElementById("rangeMoney");
var moneyOutput = document.getElementById("outputMoney");
var prevMoneyValue = moneySlider.value;
moneyOutput.innerHTML = '$' + parseFloat(moneySlider.value).toFixed(2);
moneySlider.oninput = function() {
    moneyOutput.innerHTML = '$' + parseFloat(this.value).toFixed(2);

    // falling images

    // get direction of slider movement
    var direction = 'left';
    if (this.value > prevMoneyValue) {
        direction = 'right';
    } else if (this.value < prevMoneyValue) {
        direction = 'left';
    } else {
        return;
    }
    prevMoneyValue = this.value;

    //var numImages = Math.abs(this.value - 50);
    var numImages = 1;
    var imgSrc = direction === 'left' ? '/img/emojis/fire.png' : '/img/emojis/tree.png';


    for (var i = 0; i < numImages; i++) {
        var img = document.createElement('img');
        img.src = imgSrc;
        img.classList.add('falling-image');

        // position
        var maxLeft = window.innerWidth - img.width;
        var randomLeft = Math.random() * 80;
        img.style.left = randomLeft + '%';

        document.body.appendChild(img);
        console.log("added img")

        img.addEventListener('animationend', function() {
            img.remove();
            console.log("removed img")
        });
    }
}


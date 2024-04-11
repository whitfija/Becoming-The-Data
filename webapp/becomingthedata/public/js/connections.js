var answerKey = {
    'redgroup': ["word", "word", "word", "word"],
    'bluegroup': ["word", "word", "word", "word"],
    'yellowgroup': ["word", "word", "word", "word"],
    'greengroup': ["word", "word", "word", "word"]
}
var selectedCardCount = 0;
var selected = [];

function checkAnswer() {

}

function selectWord(word) {
    if (selectedCardCount < 4) {
        selected +=
    }
}

window.onload = function() {
    var board = document.getElementsByClassName('board')[0]
    for (const word of board.children) {
        word.onclick = function() {
            selectWord(this);
        }
    }
}
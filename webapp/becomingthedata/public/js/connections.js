var answerKey = {
    'redgroup': ["FACTORY", "VEHICLE", "COAL", "FUEL"],
    'bluegroup': ["RUST", "EROSION", "DECAY", "FADING"],
    'yellowgroup': ["OZONE", "SMOG", "POLLUTANT", "ASTHMA"],
    'greengroup': ["FOREST", "LAKE", "RIVER", "WETLAND"]
}
var selectedCardCount = 0;
var selected = [];
var wrongGuessCount = 0;
var win = false;

function checkAnswer() {
    var correct = false;
    var correctGroup = '';

    // check if answer matches any group
    for (const group in answerKey) {
        const groupAnswer = answerKey[group];
        if (groupAnswer.every(word => selected.includes(word))) {
            correct = true;
            correctGroup = group;
            break;
        }
    }

    // if correct
    if (correct) {
        // hide the selected words
        const board = document.querySelector('.board');
        selected.forEach(word => {
            for (const child of board.children) {
                if (child.tagName === 'A' && child.innerText === word) {
                    child.remove();
                    break;
                }
            }
        });

        // unhide the corresponding correct answers
        const correctAnswers = document.getElementById(correctGroup);
        correctAnswers.style.display = 'block';

        // check if board cleared
        handleButtonVisibility();
    } else {
        // incorrect answer
        const alert = document.getElementById('alert');
        alert.textContent = 'Those words did not make a group, try again';
        alert.style.color = 'var(--fall-orange)';
        wrongGuessCount++;

        // give up button after 5 wrong guesses
        if (wrongGuessCount >= 5) {
            document.getElementById('giveup').style.display = 'block';
        }
    }

    selected = [];
    selectedCardCount = 0;
    const selectedWords = document.querySelectorAll('.board .selected');
    selectedWords.forEach(word => word.classList.remove('selected'));
}

function selectWord(word) {
    const alert = document.getElementById('alert');
    alert.textContent = "";
    if (selectedCardCount < 4 && !word.classList.contains('selected')) {
        word.classList.add('selected');
        selected.push(word.innerText);
        selectedCardCount++;
    } else if (word.classList.contains('selected')){
        word.classList.remove('selected');
        const index = selected.indexOf(word.innerText);
        if (index !== -1) {
            selected.splice(index, 1);
        }
        selectedCardCount--;
    }
}

function randomizeBoard() {
    const board = document.querySelector('.board');
    const words = Array.from(board.children);
    words.sort(() => Math.random() - 0.5);
    words.forEach(word => board.appendChild(word));
}

function handleButtonVisibility() {
    const checkButton = document.getElementById('checkanswer');
    const randButton = document.getElementById('rand');
    const giveUpButton = document.getElementById('giveup');
    const submitButton = document.getElementById('submit');
    const boardWords = document.querySelectorAll('.board a');
    const allGroups = document.querySelectorAll('.correct-answers .group');

    if (boardWords.length === 0 && allGroups.length === Object.keys(answerKey).length) {
        // win
        win = true;
        const alert = document.getElementById('alert');
        alert.textContent = 'Correct, congratulations! Submit your results below';
        alert.style.color = 'var(--grass-green)';
        checkButton.style.display = 'none';
        randButton.style.display = 'none';
        giveUpButton.style.display = 'none';
        submitButton.style.display = 'block';
    }
}

window.onload = function() {
    var board = document.querySelector('.board');
    var correctAnswers = document.querySelector('.correct-answers');

    // create the board
    for (const group in answerKey) {
        var groupAnswer = answerKey[group];
        groupAnswer.forEach(word => {
            const wordElement = document.createElement('a');
            wordElement.textContent = word;
            wordElement.onclick = function() {
                selectWord(this);
            };
            board.appendChild(wordElement);
        });
    }

    // randomize
    randomizeBoard();

    // create the group words tags
    for (const group in answerKey) {
        var groupAnswer = answerKey[group];
        var groupWords = groupAnswer.join(', ');
        var groupElement = document.getElementById(group);
        groupElement.querySelector('.group-words').textContent = groupWords;
    }
}
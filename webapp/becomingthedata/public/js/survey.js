
// boolean variables for each question
var q1Selected = false;
var q2Selected = false;
var q3Selected = false;

// toggle the selected class and update the boolean variable
function toggleSelected(question, selected) {
    if (selected) {
        document.getElementById(question + '-yes').classList.add('selected');
        document.getElementById(question + '-no').classList.remove('selected');
    } else {
        document.getElementById(question + '-yes').classList.remove('selected');
        document.getElementById(question + '-no').classList.add('selected');
    }
    // update the boolean variable for the question
    window[question + 'Selected'] = selected;
}

// listeners for yes/no buttons
document.getElementById('q1-yes').addEventListener('click', function(event) {
    toggleSelected('q1', true);
});
document.getElementById('q2-yes').addEventListener('click', function(event) {
    toggleSelected('q2', true);
});
document.getElementById('q3-yes').addEventListener('click', function(event) {
    toggleSelected('q3', true);
});
document.getElementById('q1-no').addEventListener('click', function(event) {
    toggleSelected('q1', false);
});
document.getElementById('q2-no').addEventListener('click', function(event) {
    toggleSelected('q2', false);
});
document.getElementById('q3-no').addEventListener('click', function(event) {
    toggleSelected('q3', false);
});
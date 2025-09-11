var activeClone;
var startX, startY, initialX, initialY;

function initializeDraggability() {
    interact('.bubble').draggable({
        listeners: {
            autoScroll: true,

            start(event) {
                event.preventDefault()

                // clone clicked bubble, original's display to none
                const target = event.target;
                activeClone = target.cloneNode(true);
                document.body.appendChild(activeClone);

                // clone should start on same exact spot as the original
                // pull clone out of container so it can be dragged anywhere and z index so that its above everything
                const rect = target.getBoundingClientRect();
                activeClone.style.position = 'absolute';
                activeClone.style.left = `${rect.left}px`;
                activeClone.style.top = `${rect.top}px`;
                activeClone.style.zIndex = 1000;
                

                // whatever setup needed so im now moving the clone instead of the original
                target.style.visibility = 'hidden';
                activeClone.dataset.original = target;
                startX = event.clientX - rect.left;
                startY = event.clientY - rect.top;
                initialX = rect.left + window.scrollX;
                initialY = rect.top + window.scrollY;
            },
            move(event) {
                event.preventDefault()
                // clone should now follow the mouse until end, match positions
                const x = event.clientX - startX + window.scrollX;
                const y = event.clientY - startY + window.scrollY;
                activeClone.style.left = `${x}px`;
                activeClone.style.top = `${y}px`;
                console.log(x + ', ' + y)
            },
            end(event) {
                event.preventDefault()

                const meBubble = document.querySelector('.mebubble');
                const bubbleSelect = document.querySelector('.bubbleselect');
                const original = event.target;

                const meBubbleRect = meBubble.getBoundingClientRect();
                const bubbleSelectRect = bubbleSelect.getBoundingClientRect();
                const cloneRect = activeClone.getBoundingClientRect();

                if (isNear(cloneRect, meBubbleRect)) {
                    if (!meBubble.contains(original)) {
                        meBubble.appendChild(original);
                        original.style.visibility = 'visible';
                        activeClone.remove();
                    } else {
                        original.style.visibility = 'visible';
                        activeClone.remove();
                    }

                    // position
                    const bubbleWidth = original.offsetWidth;
                    const bubbleHeight = original.offsetHeight;
                    const offsetX = event.clientX - meBubbleRect.left - bubbleWidth / 2; 
                    const offsetY = event.clientY - meBubbleRect.top - bubbleHeight / 2;
                    original.style.position = 'absolute'; 
                    original.style.left = `${offsetX}px`;
                    original.style.top = `${offsetY}px`;
                } else if (isNear(cloneRect, bubbleSelectRect)) {
                    if (!bubbleSelect.contains(original)) {
                        bubbleSelect.appendChild(original);
                        original.style.visibility = 'visible';
                        activeClone.remove();
                        original.style.position = 'static';
                        sortBubbles(); 
                    } else {
                        original.style.visibility = 'visible';
                        activeClone.remove();
                    }
                } else {
                    original.style.visibility = 'visible';
                    activeClone.remove();
                }
            },
        }
    }).gesturable({
        listeners: {
            start(event) {
                event.preventDefault();
            }
        }
    });
}

function isNear(rect1, rect2) {
    return !(rect1.right < rect2.left ||
             rect1.left > rect2.right ||
             rect1.bottom < rect2.top ||
             rect1.top > rect2.bottom);
}

const heritages = [
    "African", "African American", "Arab", "Armenian", "Asian", "Assyrian", "Australian", "Austrian", "Bangladeshi", "Belgian", "Brazilian", "British", "Bulgarian", 
    "Cambodian", "Canadian", "Caribbean", "Chinese", "Colombian","Cuban", "Cypriot", "Czech", "Danish", "Dutch", "Egyptian", "English", "Ethiopian", "Filipino",
    "Finnish", "French", "German", "Greek", "Guatemalan", "Haitian", "Hispanic", "Hungarian", "Indian", "Indigenous", "Indonesian", "Iranian", "Iraqi", "Irish",
    "Israeli", "Italian", "Japanese", "Jewish", "Korean", "Laotian", "Latvian", "Lebanese", "Lithuanian", "Malaysian", "Mexican", "Native American", "Nigerian",
    "Norwegian", "Palestinian", "Pakistani", "Peruvian", "Polish", "Portuguese", "Puerto Rican", "Romanian", "Russian", "Scottish", "Serbian", "Somali",
    "South African", "Spanish", "Sri Lankan", "Swedish", "Swiss", "Syrian", "Thai", "Turkish", "Ukrainian", "Venezuelan", "Vietnamese", "Welsh", "Yoruba", "Zulu"
];
const languages = [
    'Speak Only English', 'Spanish or Spanish Creole', 'French (Incl. Patois, Cajun)', 'French Creole', 'Italian', 'Portuguese or Portuguese Creole',
    'German', 'Yiddish', 'Other West Germanic Languages', 'Scandinavian Languages', 'Greek', 'Russian', 'Polish', 'Serbo-Croatian', 'Other Slavic Languages', 'Armenian',
    'Persian', 'Gujarati', 'Hindi', 'Urdu', 'Other Indic Languages', 'Other Indo-European Languages', 'Chinese', 'Japanese', 'Korean', 'Mon-Khmer, Cambodian', 'Hmong',
    'Thai', 'Laotian', 'Vietnamese', 'Other Asian Languages', 'Tagalog', 'Other Pacific Island Languages', 'Navajo', 'Other Native North American Languages', 'Hungarian',
    'Arabic', 'Hebrew', 'African Languages', 'Other and Unspecified Languages'
];

function buildBubbles() {
    const bubbleselect = document.getElementsByClassName('bubbleselect')[0];
    bubbleselect.innerHTML = '';

    heritages.forEach(heritage => {
        const div = document.createElement('div');
        div.className = 'bubble heritage';
        div.draggable = false;
        div.textContent = heritage;
        bubbleselect.appendChild(div);
    });

    languages.forEach(language => {
        const div = document.createElement('div');
        div.className = 'bubble language';
        div.draggable = false;
        div.textContent = language;
        bubbleselect.appendChild(div);
    });

    const mebubble = document.getElementsByClassName('mebubble')[0];
    mebubble.innerHTML = '';

    initializeDraggability()
}

function sortBubbles() {
    const bubbleselect = document.getElementsByClassName('bubbleselect')[0];
    const bubbles = Array.from(bubbleselect.getElementsByClassName('bubble'));

    bubbles.sort((a, b) => a.innerText.localeCompare(b.innerText));

    bubbles.forEach(bubble => {
        bubbleselect.appendChild(bubble);
    });
}

function saveBubble() {
    const mebubble = document.querySelector('.mebubble');
    const bubbles = mebubble.getElementsByClassName('bubble');
    
    const bubbleData = Array.from(bubbles).map(bubble => {
        const rect = bubble.getBoundingClientRect();
        const meBubbleRect = mebubble.getBoundingClientRect();
        const left = rect.left - meBubbleRect.left;
        const top = rect.top - meBubbleRect.top;
        const bubbleType = bubble.classList.contains('heritage') ? 'heritage' : 
                           bubble.classList.contains('language') ? 'language' : 
                           'unknown';
        return {
            text: bubble.textContent,
            position: {
                left: left,
                top: top
            },
            type: bubbleType
        };
    });

    console.log('Saved bubble data:', bubbleData);
    submitSurveyResponse('mebubble', bubbleData);
}


let showing = 'default';
function showLanguage() {
    const heritageBubbles = document.querySelectorAll('.bubbleselect .bubble.heritage');
    const languageBubbles = document.querySelectorAll('.bubbleselect .bubble.language');
    const header = document.querySelector('.selectheader');
    if (showing === 'language') {
        showDefault()
    } else {
        heritageBubbles.forEach(bubble => bubble.style.display = 'none');
        languageBubbles.forEach(bubble => bubble.style.display = 'inline-block');
        showing = 'language';
        header.textContent = 'Attributes - Language Only';
    }
}

function showHeritage() {
    const heritageBubbles = document.querySelectorAll('.bubbleselect .bubble.heritage');
    const languageBubbles = document.querySelectorAll('.bubbleselect .bubble.language');
    const header = document.querySelector('.selectheader');
    if (showing === 'heritage') {
        showDefault()
    } else {
        heritageBubbles.forEach(bubble => bubble.style.display = 'inline-block');
        languageBubbles.forEach(bubble => bubble.style.display = 'none');
        showing = 'heritage';
        header.textContent = 'Attributes - Heritage Only';
    }
}

function showDefault() {
    const heritageBubbles = document.querySelectorAll('.bubbleselect .bubble.heritage');
    const languageBubbles = document.querySelectorAll('.bubbleselect .bubble.language');
    const header = document.querySelector('.selectheader');
    heritageBubbles.forEach(bubble => bubble.style.display = 'inline-block');
    languageBubbles.forEach(bubble => bubble.style.display = 'inline-block');
    showing = 'default';
    header.textContent = 'Attributes';
}

// fetch dots data from the backend
async function fetchDotsData() {
    try {
        const response = await fetch('/api/dots');
        if (!response.ok) {
            throw new Error('Failed to fetch dots data');
        }
        const dots = await response.json();
        return dots;
    } catch (error) {
        console.error('Error fetching dots data:', error);
        return [];
    }
}

// update map with dots data
async function updateMap() {
    try {
        // fetch dots data from the backend
        const response = await fetch('/api/dots');
        if (!response.ok) {
            throw new Error('Failed to fetch dots data');
        }
        const dotsData = await response.json();


        if (dotsData.length > 0) {
            // clear existing dots on the map
            dotMarkers.forEach(marker => {
                map.removeLayer(marker);
            });
            dotMarkers.length = 0;
        }

        // add new dots to the map
        //console.log("updating map")
        dotsData.forEach(dotData => {
            const dotMarker = L.circleMarker([dotData.longitude, dotData.latitude], {
                color: '#' + dotData.colorHex,
                fillColor: '#' + dotData.colorHex,
                fillOpacity: 0.7,
                radius: 8
            }).addTo(map);

            dotMarker.on('mouseover', function (event) {
                event.target.setStyle({ fillOpacity: 1.0 });
            });

            dotMarker.on('mouseout', function (event) {
                event.target.setStyle({ fillOpacity: 0.7 });
            });

            fishtext = ''
            if (dotData.visitorData.exhibitsvisited.oceans) { 
                fishtext = `<div class="popupcustom" style="max-width: 140px;transform: translateY(15px) scale(1.5);"><canvas id="fishCanvas${dotData.sessionId}" class="fishCanvas" width="300" height="300""></canvas><h2 class="fishName">${dotData.visitorData.exhibitinfo.oceans.name}</h2></div>`
            }

            bubbletext = ''
            if (dotData.visitorData.exhibitsvisited.mebubble) {
                bubbletext = `<div class="mebubble">`

                dotData.visitorData.exhibitinfo.mebubble.forEach(bubble => { 
                    bubbletext+= `<div class="bubble ${bubble.type}" style="position: absolute; left: ${bubble.position.left * 0.5}px; top: ${bubble.position.top * 0.5}px;">${bubble.text}</div>`
                }); 

                bubbletext += `</div>`
            }

            dotMarker.bindPopup(`
                <div class=popupcustom>
                    <img src="/img/personalities/${dotData.group}.png" style="width: 150px; height: auto"><br>
                    <div style="display: flex; flex-direction: row" >
                        ${fishtext}
                        ${bubbletext}
                    </div>
                    <p>Created: ${new Date(dotData.timestamp).toLocaleString()}</p>
                </div>
            `);

            dotMarkers.push(dotMarker);

            // draw fish
            dotMarker.on('popupopen', function () {
                if (dotData.visitorData.exhibitsvisited.oceans) {
                    var imageData = dotData.visitorData.exhibitinfo.oceans.canvas;
                    var canvas = document.getElementById('fishCanvas' + dotData.sessionId);
                    var ctx = canvas.getContext('2d');
                    var img = new Image();
                    img.onload = function() {
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = imageData;
                }
            });
        });
    } catch (error) {
        console.error('Error updating map:', error);
    }
}

// timer to periodically update map
const refreshInterval = 20000; //
setInterval(updateMap, refreshInterval);

// tooltip
const tooltipToggle = document.getElementById('tooltip-toggle');
const tooltipText = document.getElementById('tooltip-text');

tooltipToggle.addEventListener('click', () => {
    tooltipText.style.display = tooltipText.style.display === 'block' ? 'none' : 'block';
});
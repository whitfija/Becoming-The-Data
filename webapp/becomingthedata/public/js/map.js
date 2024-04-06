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

            dotMarker.bindPopup(`
                <img src="/img/personalities/${dotData.group}.png" style="width: 100%; height: auto">
                <p>Created: ${new Date(dotData.timestamp).toLocaleString()}</p>
            `);

            dotMarkers.push(dotMarker);
        });
    } catch (error) {
        console.error('Error updating map:', error);
    }
}

// timer to periodically update map
const refreshInterval = 10000; // 1 minute (adjust as needed)
setInterval(updateMap, refreshInterval);

// tooltip
const tooltipToggle = document.getElementById('tooltip-toggle');
const tooltipText = document.getElementById('tooltip-text');

tooltipToggle.addEventListener('click', () => {
    tooltipText.style.display = tooltipText.style.display === 'block' ? 'none' : 'block';
});
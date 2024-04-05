// Function to fetch dots data from the backend
async function fetchDotsData() {
    try {
        const response = await fetch('/api/dots'); // Replace '/api/dots' with your backend endpoint to fetch dots data
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

// Function to update map with dots data
async function updateMap() {
    try {
        // Fetch dots data from the backend
        const response = await fetch('/api/dots'); // Replace '/api/dots' with your backend endpoint to fetch dots data
        if (!response.ok) {
            throw new Error('Failed to fetch dots data');
        }
        const dotsData = await response.json();

        // Clear existing dots on the map
        dotMarkers.forEach(marker => {
            map.removeLayer(marker);
        });
        dotMarkers.length = 0;

        // Add new dots to the map
        console.log("updating map")
        dotsData.forEach(dotData => {
            const dotMarker = L.circleMarker([dotData.longitude, dotData.latitude], {
                color: '#' + dotData.colorHex,
                fillColor: '#' + dotData.colorHex,
                fillOpacity: 1,
                radius: 8
            }).addTo(map);

            dotMarker.bindPopup(`
                <img src="/img/personalities/${dotData.group}.png" style="width: 100%; height: auto">
                <p>Creation Date: ${new Date(dotData.timestamp).toLocaleString()}</p>
            `);

            dotMarkers.push(dotMarker);
        });
    } catch (error) {
        console.error('Error updating map:', error);
    }
}

// Set up timer to periodically update map
const refreshInterval = 10000; // 1 minute (adjust as needed)
setInterval(updateMap, refreshInterval);
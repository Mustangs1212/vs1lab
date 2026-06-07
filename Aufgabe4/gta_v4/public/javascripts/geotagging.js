// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

function updateLocation() {

    const tagLatitude = document.getElementById("tag-form-lat");
    const tagLongitude = document.getElementById("tag-form-lon");
    const disLatitude = document.getElementById("discov-form-lat");
    const disLongitude = document.getElementById("discov-form-lon");

    const tagLatVal = parseFloat(tagLatitude.value);
    const tagLonVal = parseFloat(tagLongitude.value);
    const disLatVal = parseFloat(disLatitude.value);
    const disLonVal = parseFloat(disLongitude.value);

    if (
        isNaN(tagLatVal) || isNaN(tagLonVal) || isNaN(disLatVal) || isNaN(disLonVal)
        || tagLatVal !== disLatVal || tagLonVal !== disLonVal
    ) {
        console.log("update Location ...");

        LocationHelper.findLocation((helper) => {
            const lat = helper.latitude;
            const lon = helper.longitude;
            tagLatitude.value = lat;
            tagLongitude.value = lon;
            disLatitude.value = lat;
            disLongitude.value = lon;

            updateMap(lat, lon);
        });

    } else {
        console.log("use old Location");
        updateMap(tagLatVal, tagLonVal);
    }

}

function updateMap(lat, lon) {
    console.log(`lat: ${lat}, lon: ${lon}`)

    const taglist_json = document.getElementById("map").dataset.tags;
    const taglist = JSON.parse(taglist_json);

    let manager = new MapManager();
    manager.initMap(lat, lon);
    manager.updateMarkers(lat, lon, taglist);
    document.getElementById("mapView").remove();
    document.querySelector("#map span").remove();
}

function executeTagging() {
    const lat = document.getElementById("tag-form-lat").value;
    const lon = document.getElementById("tag-form-lon").value;
    const name = document.getElementById("tag-form-name").value;
    const hashtag = document.getElementById("tag-form-hash").value; // KORRIGIERT: -hash statt -hashtag

    // Sende die Daten als JSON an den Server
    fetch('/tagging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon, name: name, hashtag: hashtag })
    })
    .then(response => response.json())
    .then(taglist => {
        // Bereite das HTML-Karten-Element für eine Neuinitialisierung vor
        const mapContainer = L.DomUtil.get('map');
        if (mapContainer != null) {
            mapContainer._leaflet_id = null; 
        }

        let manager = new MapManager();
        manager.initMap(lat, lon);
        manager.updateMarkers(lat, lon, taglist);
    })
    .catch(error => console.error("Fehler beim Tagging:", error));
}

function executeDiscovery() {
    const lat = parseFloat(document.getElementById("discov-form-lat").value);
    const lon = parseFloat(document.getElementById("discov-form-lon").value);
    const searchterm = document.getElementById("search-form-searchterm").value; 

    if (isNaN(lat) || isNaN(lon)) {
        console.error("Ungültige Koordinaten für die Suche");
        return;
    }

    // Per Fetch an die Discovery-Route senden
    fetch('/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lon, searchterm: searchterm })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Server-Fehler bei der Suche");
        }
        return response.json();
    })
    .then(taglist => {
        console.log("Empfangene GeoTags vom Server:", taglist);

        // 1. SCHRITT: DIE LISTE LINKS NEBEN DER KARTE AKTUALISIEREN
        const resultsList = document.getElementById("discoveryResults");
        if (resultsList) {
            resultsList.innerHTML = ""; // Löscht die alten Einträge aus der HTML-Liste

            // Befülle die Liste mit den neuen, gefilterten Daten
            taglist.forEach(gtag => {
                const li = document.createElement("li");
                li.textContent = `${gtag.name} ( ${gtag.latitude}, ${gtag.longitude}) ${gtag.hashtag || ''}`;
                resultsList.appendChild(li);
            });
        }

        // 2. SCHRITT: DIE KARTE UND PINS AKTUALISIEREN
        // Bereite das HTML-Karten-Element vor, damit Leaflet nicht blockiert
        const mapContainer = L.DomUtil.get('map');
        if (mapContainer != null) {
            mapContainer._leaflet_id = null; 
        }

        let manager = new MapManager();
        manager.initMap(lat, lon);
        manager.updateMarkers(lat, lon, taglist);
    })
    .catch(error => console.error("Fehler bei der Suche:", error));
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();

    // 1. Formular für "Tagging" abfangen
    const tagForm = document.getElementById("tag-form"); 
    if (tagForm) {
        tagForm.addEventListener("submit", (event) => {
            event.preventDefault(); 
            executeTagging();       
        });
    }

    // 2. Formular für "Discovery" abfangen
    const discovForm = document.getElementById("discoveryFilterForm"); // KORRIGIERT: ID aus HTML
    if (discovForm) {
        discovForm.addEventListener("submit", (event) => {
            event.preventDefault(); // Verhindert jetzt zuverlässig den Reload!
            executeDiscovery();     
        });
    }
});


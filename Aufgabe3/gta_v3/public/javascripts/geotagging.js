// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

// This script is executed when the browser loads index.html.

// "console.log" writes to the browser's console. 
// The console window must be opened explicitly in the browser.
// Try to find this output in the browser...
console.log("The geoTagging script is going to start...");

// Here the API used for geolocations is selected
// The following declaration is a 'mockup' that always works and returns a fixed position.
var GEOLOCATION_API = {
    getCurrentPosition: function (onsuccess) {
        onsuccess({
            "coords": {
                "latitude": 49.013790,
                "longitude": 8.390071,
                "altitude": null,
                "accuracy": 39,
                "altitudeAccuracy": null,
                "heading": null,
                "speed": null
            },
            "timestamp": 1775140116396
        });
    }
};

// This is the real API.
// If there are problems with it, comment out the line.
GEOLOCATION_API = navigator.geolocation;

function updateLocation() {
    let manager = new MapManager();
    let lat;
    let lon;
    LocationHelper.findLocation((helper) => {
        const tagLatitude = document.getElementById("tag-form-lat");
        const tagLongitude = document.getElementById("tag-form-lon");
        const disLatitude = document.getElementById("discov-form-lat");
        const disLongitude = document.getElementById("discov-form-lon");
        lat = helper.latitude;
        lon = helper.longitude;
        tagLatitude.value = lat;
        tagLongitude.value = lon;
        disLatitude.value = lat;
        disLongitude.value = lon;
        manager.initMap(lat, lon);
        manager.updateMarkers(lat, lon);

        document.getElementById("mapView").remove();
        document.querySelector("#map span").remove();
    });
}

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {

    const tagLat = parseFloat(document.getElementById("tag-form-lat").value);
    const tagLon = parseFloat(document.getElementById("tag-form-lon").value);

    const disLat = parseFloat(document.getElementById("discov-form-lat").value);
    const disLon = parseFloat(document.getElementById("discov-form-lon").value);

    if (isNaN(tagLat) || isNaN(tagLon) || isNaN(disLat) || isNaN(disLon)) {
        updateLocation();
    }
});

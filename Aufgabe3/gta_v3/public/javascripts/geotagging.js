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

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    updateLocation();
});

// File origin: VS1LAB A2

/* eslint-disable no-unused-vars */

"use strict";

let tagForm;
let disForm;

let tagName
let tagHash
let tagLatitude;  
let tagLongitude;

let disLatitude;  
let disLongitude; 
let disSearchterm;
let disResults;

// Wait for the page to fully load its DOM content, then call updateLocation
document.addEventListener("DOMContentLoaded", () => {
    console.log("The geoTagging script is going to start...");

    tagForm = document.getElementById("tag-form");
    disForm = document.getElementById("discoveryFilterForm");

    tagName = document.getElementById("tag-form-name");
    tagHash = document.getElementById("tag-form-hash");
    tagLatitude  = document.getElementById("tag-form-lat");
    tagLongitude = document.getElementById("tag-form-lon");

    disLatitude   = document.getElementById("discov-form-lat");
    disLongitude  = document.getElementById("discov-form-lon");
    disSearchterm = document.getElementById("search-form-searchterm");
    disResults    = document.getElementById("discoveryResults");

    updateLocation();

    tagForm.addEventListener("submit", postGeoTag);
    disForm.addEventListener("submit", discoverTags);

});

function updateLocation() {

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

async function postGeoTag(event) {
    event.preventDefault();

    fetch("http://localhost:3000/api/geotags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{\
            "latitude": ${parseFloat(tagLatitude.value)},\
            "longitude": ${parseFloat(tagLongitude.value)},\
            "name": "${tagName.value}",\
            "hashtag": "${tagHash.value}"\
        }`
    })
    .then(response => response.json())
    .then(data => console.log('Erfolg:', data))
    .catch(error => console.error('Fehler:', error));
}

async function discoverTags(event) {

    event.preventDefault();

    let search = encodeURIComponent(disSearchterm.value);
    search = disSearchterm.value ? `&searchterm=${search}` : ``;

    fetch(
        `http://127.0.0.1:3000/api/geotags`
        + `?latitude=${parseFloat(disLatitude.value)}`
        + `&longitude=${parseFloat(disLongitude.value)}`
        + search
    ).then(response => response.json())
    .then(json => {
        disResults.innerHTML = "";
        json.forEach((gtag) => disResults.innerHTML += `<li>${gtag.name} (${gtag.latitude}, ${gtag.longitude}) ${gtag.hashtag}</li>`);
    });

}

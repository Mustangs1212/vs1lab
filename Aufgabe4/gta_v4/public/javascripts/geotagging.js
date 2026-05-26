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

let discoveryNext;
let discoveryPrev;
let dixcoveryCurrentPage;
let maxPage;
let nextId;
let prevId;

let manager;

const PAGE_SIZE = 8;

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

    discoveryNext = document.getElementById("discoveryNext");
    discoveryPrev = document.getElementById("discoveryPrev");
    dixcoveryCurrentPage = document.getElementById("currentPage");
    maxPage = document.getElementById("maxPage");

    manager = new MapManager();

    updateLocation();

    tagForm.addEventListener("submit", postGeoTag);
    disForm.addEventListener("submit", discoverTags);

    discoveryNext.addEventListener("click", nextPage);
    discoveryPrev.addEventListener("click", prevPage);

    document.getElementById("tag-form-submit").disabled = false;
    document.getElementById("search-form-submit").disabled = false;

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

            initMap(lat, lon);
        });

    } else {
        console.log("use old Location");
        initMap(tagLatVal, tagLonVal);
    }

}

function initMap(lat, lon) {
    console.log(`lat: ${lat}, lon: ${lon}`)

    const taglist_json = document.getElementById("map").dataset.tags;
    const taglist = JSON.parse(taglist_json);

    document.getElementById("mapView").remove();
    document.querySelector("#map span").remove();
    
    manager.initMap(lat, lon);
    manager.updateMarkers(lat, lon, taglist);
}

function updatePageControlls(meta) {
    
    console.log("" + meta.prevId + meta.nextId);

    discoveryPrev.disabled = meta.prevId === undefined ? true : false;
    discoveryNext.disabled = meta.nextId === undefined ? true : false;

    nextId = meta.nextId;
    prevId = meta.prevId;

    dixcoveryCurrentPage.innerText = meta.pageNumber + 1;
    maxPage.innerText = meta.pageCount;
}

async function f(id) {
    event.preventDefault();

    let search = encodeURIComponent(disSearchterm.value);
    search = disSearchterm.value ? `&searchterm=${search}` : ``;

    const lat = parseFloat(disLatitude.value)
    const lon = parseFloat(disLongitude.value);

    const res = await fetch(
        `http://127.0.0.1:3000/api/geotags/page`
        + `?pageSize=${PAGE_SIZE}`
        + `&lastId=${id}`
        + `&latitude=${lat}`
        + `&longitude=${lon}`
        + search
    ).then(response => response.json());
    const tags = res.data;
    const meta = res.meta;

    // update page contolls
    updatePageControlls(meta);

    // update list
    disResults.innerHTML = "";
    tags.forEach((gtag) => disResults.innerHTML += `<li>${gtag.name} (${gtag.latitude}, ${gtag.longitude}) ${gtag.hashtag}</li>`);

    // update map
    manager.updateMarkers(lat, lon, res.data);
}

async function postGeoTag(event) {
    event.preventDefault();

    console.log(tagHash.value);

    fetch("http://localhost:3000/api/geotags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: `{\
            "latitude": ${parseFloat(tagLatitude.value)},\
            "longitude": ${parseFloat(tagLongitude.value)},\
            "name": "${tagName.value}"\
            ${(tagHash.value === "" ? "" : `,"hashtag": "${tagHash.value}"` )}\
        }`
    })
    .then(response => response.json())

    tagHash.value = "";
    tagName.value= "";
}

async function discoverTags(event) {
    event.preventDefault();
    f(0);
}

async function nextPage(event) {
    event.preventDefault();
    f(nextId);
}

async function prevPage(event) {
    event.preventDefault();
    f(prevId);
}
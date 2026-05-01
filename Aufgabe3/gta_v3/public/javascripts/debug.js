/**
 * Use search/addTag after this
 * @param {number} lat
 * @param {number} lon
 */
function setLocation(lat, lon) {
    const tagLatitude = document.getElementById("tag-form-lat");
    const tagLongitude = document.getElementById("tag-form-lon");
    const disLatitude = document.getElementById("discov-form-lat");
    const disLongitude = document.getElementById("discov-form-lon");

    tagLatitude.value = lat;
    tagLongitude.value = lon;
    disLatitude.value = lat;
    disLongitude.value = lon;
}
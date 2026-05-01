// File origin: VS1LAB A3

/**
 * This script defines the main router of the GeoTag server.
 * It's a template for exercise VS1lab/Aufgabe3
 * Complete all TODOs in the code documentation.
 */

/**
 * Define module dependencies.
 */

const express = require('express');
const router = express.Router();

const GeoTag = require('../models/geotag');
const GeoTagStore = require('../models/geotag-store');
const GeoTagExamples = require("../models/geotag-examples").tagList;


/**
 * The GeoTagStore to use
 * @type {InMemoryGeoTagStore}
 */
const geoTagStore= new GeoTagStore();


/**
 *  files the store with the example Data from GeoTagExamples
 */
GeoTagExamples.forEach((example) =>
    geoTagStore.addGeoTag(new GeoTag( example[1], example[2], example[0], example[3] ))
)
console.log("new geoTagStore created!!!!!");

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

// TODO: extend the following route example if necessary
router.get('/', (req, res) => {
  res.render('index', { taglist: [] })
});

/**
 * Route '/tagging' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the tagging form in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * Based on the form data, a new geotag is created and stored.
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the new geotag.
 * To this end, "GeoTagStore" provides a method to search geotags 
 * by radius around a given location.
 */

router.post("/tagging", (req, res) => {

  const body = req.body;

  let lat = parseFloat(body.latitude);
  let lon = parseFloat(body.longitude);
  let name = body.name;
  let hash = body.hash?.charAt(0) === '#' ? body.hash : "";

  if (isNaN(lat) || isNaN(lon) || !name) {
    res.render('index', { taglist: [] })
    return;
  }

  geoTagStore.addGeoTag(new GeoTag(lat, lon, name, hash));

  res.render('index', { taglist: [geoTagStore.getNearbyGeoTags(lat, lon)] })
})

/**
 * Route '/discovery' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests cary the fields of the discovery form in the body.
 * This includes coordinates and an optional search term.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * As response, the ejs-template is rendered with geotag objects.
 * All result objects are located in the proximity of the given coordinates.
 * If a search term is given, the results are further filtered to contain 
 * the term as a part of their names or hashtags. 
 * To this end, "GeoTagStore" provides methods to search geotags 
 * by radius and keyword.
 */

router.post("/discovery", (req, res) => {

  const body = req.body;

  let lat = parseFloat(body.latitude);
  let lon = parseFloat(body.longitude);
  let searchterm = body.searchterm;

  if (isNaN(lat) || isNaN(lon)) {
    res.render('index', { taglist: [] })
    return
  }

  res.render('index', { taglist: [geoTagStore.searchNearbyGeoTags(lat, lon, searchterm)] })
})

module.exports = router;

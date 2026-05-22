// File origin: VS1LAB A3, A4

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
const geoTagStore = new GeoTagStore();


/**
 *  files the store with the example Data from GeoTagExamples
 */
GeoTagExamples.forEach((example) =>
    geoTagStore.addGeoTag(new GeoTag( example[1], example[2], example[0], example[3] ))
)

/**
 * Route '/' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests cary no parameters
 *
 * As response, the ejs-template is rendered without geotag objects.
 */

router.get('/', (req, res) => {
  res.render('index', { lat: "", lon: "", taglist: [] })
});

/*
!!! TODO move somver else
*/
function b(req, res) {
  let lat;
  let lon;
  if ("latitude" in req.query && "longitude" in req.query) {

    lat = parseFloat(req.query.latitude);
    lon = parseFloat(req.query.longitude);

    if (isNaN(lat) || isNaN(lon))
      return res.sendStatus(400);

  }

  let search
  if ("searchterm" in req.query) {

    search = req.query.searchterm;

    if (search.length > 11 && (search[0] === '#' || search.length > 10))
      return res.sendStatus(400);
  }

  return {
    lat: lat,
    lon: lon,
    search: search
  };
}

/**
 * Route '/api/geotags' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the fields of the Discovery form as query.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 */

router.get("/api/geotags", (req, res) => {

  const {lat, lon, search} = b(req, res);

  res.send(geoTagStore.searchGeoTags(lat, lon, search));

});

/**
 * Route '/api/geotags/page' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain lastId, pageSize and the fields of the Discovery form as query.
 * If 'searchterm' is present, it will be filtered by search term.
 * If 'latitude' and 'longitude' are available, it will be further filtered based on radius.
 * If lastId is present new elements are searcht from ther, if not or it is invalid it is searcht from the start
 * pageSize is requiert
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * As a response, an array with Geo Tag objects is rendered as JSON.
 */

router.get("/api/geotags/page", (req, res) => {

  const lastId   = parseFloat(req.query.lastId);
  const pageSize = parseFloat(req.query.pageSize);

  if (isNaN(lastId) || isNaN(pageSize))
    return res.sendStatus(400);

  const {lat, lon, search} = b(req, res);

  res.send(geoTagStore.searchGeoTagsPage(lat, lon, search, lastId, pageSize));
})


/**
 * Route '/api/geotags' for HTTP 'POST' requests.
 * (http://expressjs.com/de/4x/api.html#app.post.method)
 *
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.body)
 *
 * The URL of the new resource is returned in the header as a response.
 * The new resource is rendered as JSON in the response.
 */

router.post("/api/geotags", (req, res) => {

  const json = req.body;

  if (!GeoTag.isValidGeoTag(json))
    return res.sendStatus(400);

  let tag = new GeoTag(
    json.latitude,
    json.longitude,
    json.name,
    json.hashtag
  );

  geoTagStore.addGeoTag(tag);

  res.send(tag);

});


/**
 * Route '/api/geotags/:id' for HTTP 'GET' requests.
 * (http://expressjs.com/de/4x/api.html#app.get.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * The requested tag is rendered as JSON in the response.
 */

router.get("/api/geotags/:id", (req, res) => {
  
  let tag = geoTagStore.getGeoTagById(req.params.id)
  if (tag === null)
    return res.sendStatus(404);

  res.send(geoTagStore.getGeoTagById(req.params.id));
});
  

/**
 * Route '/api/geotags/:id' for HTTP 'PUT' requests.
 * (http://expressjs.com/de/4x/api.html#app.put.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 * 
 * Requests contain a GeoTag as JSON in the body.
 * (http://expressjs.com/de/4x/api.html#req.query)
 *
 * Changes the tag with the corresponding ID to the sent value.
 * The updated resource is rendered as JSON in the response. 
 */

router.put("/api/geotags/:id", (req, res) => {

  const json = req.body;

  if (!GeoTag.isValidGeoTag(json))
    return res.sendStatus(400);

  let tag = new GeoTag(
    json.latitude,
    json.longitude,
    json.name,
    json.hashtag
  );
  
  let tagUpdated = geoTagStore.updateGeoTag(tag, req.params.id);
  if (tagUpdated === null)
    return res.sendStatus(404);

  res.send(tagUpdated);
});


/**
 * Route '/api/geotags/:id' for HTTP 'DELETE' requests.
 * (http://expressjs.com/de/4x/api.html#app.delete.method)
 *
 * Requests contain the ID of a tag in the path.
 * (http://expressjs.com/de/4x/api.html#req.params)
 *
 * Deletes the tag with the corresponding ID.
 * The deleted resource is rendered as JSON in the response.
 */

router.delete("/api/geotags/:id", (req, res) => {
  
  let tag = geoTagStore.removeGeoTagById(req.params.id);
  if (tag === null)
    return res.sendStatus(404);

  res.send(tag);
});


module.exports = router;

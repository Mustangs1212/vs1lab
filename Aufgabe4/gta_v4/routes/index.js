// File origin: VS1LAB A3 / API Extension

/**
 * This script defines the main router of the GeoTag server.
 * It combines the web-view routes with a modern REST-API.
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
 * Fills the store with the example Data from GeoTagExamples
 */
GeoTagExamples.forEach((example) =>
  geoTagStore.addGeoTag(new GeoTag(example[1], example[2], example[0], example[3]))
);

// Middleware, um JSON-Daten im Request-Body lesen zu können
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// =========================================================================
// 1. BROWSER / UI ROUTEN (Für das Web-Frontend aus Teil 4.2)
// =========================================================================

/**
 * Route '/' for HTTP 'GET' requests.
 * Renders the initial ejs-template.
 */
router.get('/', (req, res) => {
  res.render('index', { lat: "", lon: "", taglist: [] });
});

/**
 * Route '/tagging' for HTTP 'POST' requests (AJAX optimized).
 */
router.post("/tagging", (req, res) => {
  const body = req.body;

  let lat = parseFloat(body.latitude);
  let lon = parseFloat(body.longitude);
  let name = body.name;
  let hash = body.hashtag?.charAt(0) === '#' ? body.hashtag : "";

  if (isNaN(lat) || isNaN(lon) || !name) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  geoTagStore.addGeoTag(new GeoTag(lat, lon, name, hash));
  res.json(geoTagStore.getNearbyGeoTags(lat, lon));
});

/**
 * Route '/discovery' for HTTP 'POST' requests (AJAX optimized).
 */
router.post("/discovery", (req, res) => {
  const body = req.body;

  let lat = parseFloat(body.latitude);
  let lon = parseFloat(body.longitude);
  let searchterm = body.searchterm;

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  res.json(geoTagStore.searchNearbyGeoTags(lat, lon, searchterm));
});


// =========================================================================
// 2. NEU: REST-API ROUTEN (`/api/geotags`) laut Checkliste
// =========================================================================

/**
 * GET /api/geotags
 * Gibt alle GeoTags zurück. Filterbar nach Location und Suchbegriff via Query.
 * Beispiel: /api/geotags?latitude=49.0&longitude=8.4&searchterm=Hochschule
 */
router.get('/api/geotags', (req, res) => {
  const { latitude, longitude, searchterm } = req.query;

  let lat = parseFloat(latitude);
  let lon = parseFloat(longitude);

  // Wenn Koordinaten als Query-Parameter übergeben wurden, filtern wir nach Proximity
  if (!isNaN(lat) && !isNaN(lon)) {
    const filteredResults = geoTagStore.searchNearbyGeoTags(lat, lon, searchterm);
    return res.json(filteredResults);
  }

  // Fallback: Wenn keine Koordinaten übergeben wurden, geben wir alle Tags aus
  // Wir nutzen getNearbyGeoTags(0,0) mit extrem großem Radius oder greifen auf alle zu.
  // Falls getNearbyGeoTags bei dir intern filtert, stellen wir sicher, dass alles kommt:
  res.json(geoTagStore.searchNearbyGeoTags(0, 0, searchterm)); 
});

/**
 * POST /api/geotags
 * Erstellt einen neuen GeoTag. 
 * Vorgabe: Response-Code 201, neuer GeoTag als JSON, URL im 'Location'-Header.
 */
router.post('/api/geotags', (req, res) => {
  const { latitude, longitude, name, hashtag } = req.body;

  let lat = parseFloat(latitude);
  let lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon) || !name) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  // Tag im Store hinzufügen (erhält dort über die geänderte Methode seine ID)
  const newTag = geoTagStore.addGeoTag(new GeoTag(lat, lon, name, hashtag));

  // URL für den Location-Header dynamisch zusammenbauen
  const locationUrl = `${req.protocol}://${req.get('host')}/api/geotags/${newTag.id}`;
  
  // Header setzen, Status 201 (Created) mitsenden und Objekt ausgeben
  res.set('Location', locationUrl);
  res.status(201).json(newTag);
});

/**
 * GET /api/geotags/:id
 * Liest einen einzelnen GeoTag anhand seiner ID aus.
 */
router.get('/api/geotags/:id', (req, res) => {
  const tag = geoTagStore.getGeoTagById(req.params.id);
  
  if (!tag) {
    return res.status(404).json({ error: "GeoTag not found" });
  }
  
  res.json(tag);
});

/**
 * PUT /api/geotags/:id
 * Aktualisiert einen bestehenden GeoTag und gibt den geänderten Tag zurück.
 */
router.put('/api/geotags/:id', (req, res) => {
  const tag = geoTagStore.getGeoTagById(req.params.id);
  
  if (!tag) {
    return res.status(404).json({ error: "GeoTag not found" });
  }

  const { latitude, longitude, name, hashtag } = req.body;
  
  // Nur Werte überschreiben, die auch tatsächlich mitgeschickt wurden
  if (latitude !== undefined) tag.latitude = parseFloat(latitude);
  if (longitude !== undefined) tag.longitude = parseFloat(longitude);
  if (name !== undefined) tag.name = name;
  if (hashtag !== undefined) tag.hashtag = hashtag;

  res.json(tag);
});

/**
 * DELETE /api/geotags/:id
 * Löscht einen GeoTag anhand seiner ID und gibt das gelöschte Objekt zurück.
 */
router.delete('/api/geotags/:id', (req, res) => {
  const deletedTag = geoTagStore.removeGeoTagById(req.params.id);
  
  if (!deletedTag) {
    return res.status(404).json({ error: "GeoTag not found" });
  }
  
  res.json(deletedTag);
});

module.exports = router;
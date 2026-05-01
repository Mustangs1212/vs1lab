// File origin: VS1LAB A3

/**
 * A class for in-memory-storage of geotags
 * 
 * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 * 
 * Provide a method 'addGeoTag' to add a geotag to the store.
 * 
 * Provide a method 'removeGeoTag' to delete geo-tags from the store by name.
 * 
 * Provide a method 'getNearbyGeoTags' that returns all geotags in the proximity of a location.
 * - The location is given as a parameter.
 * - The proximity is computed by means of a radius around the location.
 * 
 * Provide a method 'searchNearbyGeoTags' that returns all geotags in the proximity of a location that match a keyword.
 * - The proximity constrained is the same as for 'getNearbyGeoTags'.
 * - Keyword matching should include partial matches from name or hashtag fields. 
 */
class InMemoryGeoTagStore{

    /**
     * @type {GeoTag[]}
     */
    #geotags = [];

    /**
     * radius to check if a point is nearby in km
     * @Type {number}
     */
    #nearbyRadius = 5;

    /**
     * add a geotag to the store
     * @param {GeoTag} geotag
     */
    addGeoTag(geotag) {
        this.#geotags.push(geotag);
        const colorGreen = "\x1b[32m";
        const colorReset = "\x1b[0m";
        console.log(`${colorGreen}[GeoTagStore [ADD] ]${colorReset} ${geotag}`)
    }

    /**
     * removes a GeoTag with the name, name
     * @param {String} name
     * @returns {GeoTag | undefined} the deleted GeoTag or undefined if no GeoTag had the name
     */
    removeGeoTag(name) {
        let idx = this.#geotags.findIndex((el) => {
            return el.name === name;
        })

        let oldEl = this.#geotags[idx];
        if (idx !== -1) this.#geotags.splice(idx, 1);

        return oldEl;
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @return {GeoTag[]}
     */
    getNearbyGeoTags(latitude, longitude) {
        return this.#geotags.filter((tag) =>
            this.#isNearby(latitude, longitude, tag.latitude, tag.longitude)
        )
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @param {String} filter a name or hash of a geotag
     * @return {GeoTag[]}
     */
    searchNearbyGeoTags(latitude, longitude, filter) {
        return this.#geotags.filter((tag) =>
            this.#isNearby(latitude, longitude, tag.latitude, tag.longitude)
            && ( tag.name.includes(filter) || tag.hash.includes(filter) )
        )
    }

    /**
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @returns {boolean} true if points are nearby, false otherwise
     */
    #isNearby(lat1, lon1, lat2, lon2) {
        return this.#computeDistance(lat1, lon1, lat2, lon2) <= this.#nearbyRadius;
    }

    /**
     * Computes the Distance of the two points
     * src: https://www.nhc.noaa.gov/gccalc.shtml
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @return {number} Distance in km
     */
    #computeDistance(lat1, lon1, lat2, lon2){
        lat1 = (Math.PI/180) * lat1
        lat2 = (Math.PI/180) * lat2
        lon1 = (Math.PI/180) * lon1
        lon2 = (Math.PI/180) * lon2

        // compute the distance
        const cd = Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2))

        // distance conversion factor for km
        const conversionFactor = 1.852

        // go to physical units
        return cd * (180/Math.PI) * 60 * conversionFactor
    }

}

module.exports = InMemoryGeoTagStore

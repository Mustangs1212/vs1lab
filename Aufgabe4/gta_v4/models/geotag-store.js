// File origin: VS1LAB A3 / API Extension

/**
 * A class for in-memory-storage of geotags
 * * Use an array to store a multiset of geotags.
 * - The array must not be accessible from outside the store.
 */
class InMemoryGeoTagStore {

    /**
     * @type {GeoTag[]}
     */
    #geotags = [];

    /**
     * NEU: Counter für eindeutige Primärschlüssel (IDs)
     * @type {number}
     */
    #idCounter = 1;

    /**
     * radius to check if a point is nearby in km
     * @Type {number}
     */
    nearbyRadius = 5;

    /**
     * add a geotag to the store and assign an ID
     * @param {GeoTag} geotag
     * @returns {GeoTag} the added geotag with its new ID
     */
    addGeoTag(geotag) {
        // NEU: ID zuweisen und Counter erhöhen
        geotag.id = this.#idCounter++;
        
        this.#geotags.push(geotag);
        
        const colorGreen = "\x1b[32m";
        const colorReset = "\x1b[0m";
        console.log(`${colorGreen}[GeoTagStore [ADD] ]${colorReset} ID: ${geotag.id} - ${geotag.name}`);
        
        return geotag; // Wichtig für die API, um das Objekt inkl. ID zurückzugeben
    }

    /**
     * NEU: Findet einen einzelnen GeoTag anhand seiner ID
     * @param {number|String} id 
     * @returns {GeoTag|null}
     */
    getGeoTagById(id) {
        return this.#geotags.find((tag) => tag.id === parseInt(id)) || null;
    }

    /**
     * NEU: Löscht einen einzelnen GeoTag anhand seiner ID
     * @param {number|String} id 
     * @returns {GeoTag|null} Der gelöschte GeoTag oder null
     */
    removeGeoTagById(id) {
        const index = this.#geotags.findIndex((tag) => tag.id === parseInt(id));
        
        if (index !== -1) {
            const deletedTag = this.#geotags.splice(index, 1)[0];
            
            const colorGreen = "\x1b[32m";
            const colorReset = "\x1b[0m";
            console.log(`${colorGreen}[GeoTagStore [REMOVE BY ID] ]${colorReset} ID: ${id}`);
            
            return deletedTag;
        }
        return null;
    }

    /**
     * removes all GeoTags with the name of filter (Beibehalten für Abwärtskompatibilität)
     * @param {String} filter
     * @returns {number} the number of removed GeoTags
     */
    removeGeoTag(filter) {
        const oldLen = this.#geotags.length;

        this.#geotags = this.#geotags.filter((tag) => {
            return tag.name !== filter;
        });

        const remCount = oldLen - this.#geotags.length;

        const colorGreen = "\x1b[32m";
        const colorReset = "\x1b[0m";
        console.log(`${colorGreen}[GeoTagStore [REMOVE] ]${colorReset} ${remCount} * ${filter}`);

        return remCount;
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @return {GeoTag[]}
     */
    getNearbyGeoTags(latitude, longitude) {
        return this.#geotags.filter((tag) =>
            this.#isNearby(latitude, longitude, tag.latitude, tag.longitude)
        );
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @param {String} filter a name or hash of a geotag
     * @return {GeoTag[]}
     */
    searchNearbyGeoTags(latitude, longitude, filter) {
        // Falls gar keine Location-Daten oder 0 mitgegeben werden, filtern wir NUR nach dem Keyword
        if (latitude === 0 && longitude === 0) {
            if (!filter) return this.#geotags;
            return this.#geotags.filter((tag) => 
                (tag.name && tag.name.includes(filter)) || (tag.hashtag && tag.hashtag.includes(filter))
            );
        }

        if (!filter) return this.getNearbyGeoTags(latitude, longitude);

        return this.#geotags.filter((tag) =>
            this.#isNearby(latitude, longitude, tag.latitude, tag.longitude)
            && ( (tag.name && tag.name.includes(filter)) || (tag.hashtag && tag.hashtag.includes(filter)) )
        );
    }

    /**
     * @param {number} lat1
     * @param {number} lon1
     * @param {number} lat2
     * @param {number} lon2
     * @returns {boolean} true if points are nearby, false otherwise
     */
    #isNearby(lat1, lon1, lat2, lon2) {
        return this.#computeDistance(lat1, lon1, lat2, lon2) <= this.nearbyRadius;
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
        lat1 = (Math.PI/180) * lat1;
        lat2 = (Math.PI/180) * lat2;
        lon1 = (Math.PI/180) * lon1;
        lon2 = (Math.PI/180) * lon2;

        // compute the distance
        const cd = Math.acos(Math.sin(lat1)*Math.sin(lat2)+Math.cos(lat1)*Math.cos(lat2)*Math.cos(lon1-lon2));

        // distance conversion factor for km
        const conversionFactor = 1.852;

        // go to physical units
        return cd * (180/Math.PI) * 60 * conversionFactor;
    }

}

module.exports = InMemoryGeoTagStore;
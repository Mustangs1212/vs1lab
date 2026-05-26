// File origin: VS1LAB A3

const GeoTag = require("./geotag");

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
    nearbyRadius = 5;

    /**
     * @Type {number}
     */
    #nextId = 0;

    /**
     * add a geotag to the store
     * @param {GeoTag} geotag
     * @returns {number} id of the geoTag
     */
    addGeoTag(geotag) {

        geotag.id = this.#nextId;
        this.#nextId++;

        this.#geotags.push(geotag);

        const colorGreen = "\x1b[32m";
        const colorReset = "\x1b[0m";
        console.log(`${colorGreen}[GeoTagStore [ADD] ]${colorReset} ${geotag}`)

        return geotag.id;
    }

    updateGeoTag(newTag, id) {
        let index = this.#getIndexById(id);
        if (index === -1) return null;

        this.#geotags[index] = newTag;
        this.#geotags[index].id = id;

        return this.#geotags[index];
    }

    /**
     * removes all GeoTags with the name of filter
     * @param {String} filter
     * @returns {number} the number of removed GeoTags
     */
    removeGeoTag(filter) {
        const oldLen = this.#geotags.length;

        this.#geotags = this.#geotags.filter((tag) => {
            return tag.name !== filter;
        })

        const remCount = oldLen - this.#geotags.length;

        const colorGreen = "\x1b[32m";
        const colorReset = "\x1b[0m";
        console.log(`${colorGreen}[GeoTagStore [REMOVE] ]${colorReset} ${remCount} * ${filter}`)

        return remCount;
    }

    removeGeoTagById(id) {
        let index = this.#getIndexById(id);
        if (index === -1) return null;

        let out = this.#geotags[index];
        this.#geotags.splice(index, 1);

        return out;
    }

    /**
     * @param {number} id
     * @return {number} index
     */
    #getIndexById(id) {
        if (this.#geotags.at(-1).id < id || id < this.#geotags.at(0).id)
            return -1;
        
        return this.#geotags.findIndex((tag) =>
            tag.id == id
        )
    }

    /**
     * @param {number} id
     * @return {GeoTag | null}
     */
    getGeoTagById(id) {

        let index = this.#getIndexById(id);
        if (index === -1) return null;

        return this.#geotags[index];
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @param {String} searchterm a name or hash of a geotag
     * @return {GeoTag[]}
     */
    searchGeoTags(latitude, longitude, searchterm) {
        return this.#geotags.filter((tag) => this.#geotagFilter(latitude, longitude, searchterm, tag));
    }

    /**
     * @param {number} latitude
     * @param {number} longitude
     * @param {String} searchterm a name or hash of a geotag
     * @param {number} lastId
     * @param {number} pageSize
     * @return {{
     *      lastIdIsValid: boolean,
     *      maybeMore: boolean,
     *      data: GeoTag[],
     * }}
     */
    searchGeoTagsPage(latitude, longitude, searchterm, lastId, pageSize) {
        
        let page = new Array();
        let pageIndex = 0;
        let filteredIndex = 0;

        let firstIndex;
        let lastIndex;

        const filtered = this.#geotags.filter((tag) => {
            const ok = this.#geotagFilter(latitude, longitude, searchterm, tag);

            if (ok) {
                if (tag.id >= lastId) {

                    if (page.length < pageSize) {
                        page.push(tag);
                    }

                    if (firstIndex === undefined) {
                        firstIndex = filteredIndex;
                    } else if (pageIndex === pageSize) {
                        lastIndex = filteredIndex;
                    }

                    pageIndex++;
                }

                filteredIndex++;
            }

            return ok;
        });

        if (lastIndex === undefined) lastIndex = filteredIndex;
        const pageCount = Math.ceil( filtered.length / pageSize );

        return {
            meta: {
                pageCount: pageCount,
                totalItems: filtered.length,
                prevId: firstIndex - pageSize < 0 ? undefined : filtered.at(firstIndex - pageSize)?.id,
                nextId: filtered.at(lastIndex)?.id,

                pageNumber:  Math.floor((firstIndex + 1) / pageSize),
                itemsInPage: page.length,
            },
            data: page,
        };
    }

    /**
     * @param {string} searchterm search param
     * @param {number} latitude search param
     * @param {number} longitude search param
     * @param {GeoTag} tag tag to filter
     * @returns {boolean}
     */
    #geotagFilter(latitude, longitude, searchterm, tag) {

        const locationOk = (!latitude || !longitude)
            ? true 
            : this.#computeDistance(latitude, longitude, tag.latitude, tag.longitude) <= this.nearbyRadius;

        const nameOk = (searchterm == "" || searchterm === undefined || searchterm == null)
            ? true
            : tag.name.includes(searchterm) || tag.hashtag.includes(searchterm);

        return locationOk && nameOk;
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

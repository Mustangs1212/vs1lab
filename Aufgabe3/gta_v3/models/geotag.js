// File origin: VS1LAB A3

/** *
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {

    /**
     * @type {number}
     */
    #latitude;

    /**
     * @type {number}
     */
    #longitude;

    /**
     * @type {string}
     */
    #name;

    /**
     * @type {string}
     */
    #hash;

    /**
     *
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} name
     * @param {string} hash
     */
    constructor(latitude, longitude, name, hash) {
        this.#latitude = latitude;
        this.#longitude = longitude;
        this.#name = name;
        this.#hash = hash;
    }

    /**
     * @returns {number}
     */
    get latitude() {
        return this.#latitude;
    }

    /**
     * @returns {number}
     */
    get longitude() {
        return this.#longitude;
    }

    /**
     * @returns {string}
     */
    get name() {
        return this.#name;
    }

    /**
     * @returns {string}
     */
    get hash() {
        return this.#hash;
    }
}

module.exports = GeoTag;

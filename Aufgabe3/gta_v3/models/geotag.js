// File origin: VS1LAB A3

/** *
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {

    /**
     * @type {number}
     */
    latitude;

    /**
     * @type {number}
     */
    longitude;

    /**
     * @type {string}
     */
    name;

    /**
     * @type {string}
     */
    hashtag;

    /**
     *
     * @param {number} latitude
     * @param {number} longitude
     * @param {string} name
     * @param {string} hash
     */
    constructor(latitude, longitude, name, hash) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        this.hashtag = hash;
    }

    toString() {
        return `GeoTag: {lat=${this.latitude}, lon=${this.longitude}, name="${this.name}", hash="${this.hashtag}"}`;
    }
}

module.exports = GeoTag;

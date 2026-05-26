// File origin: VS1LAB A3

/** *
 * A class representing geotags.
 * GeoTag objects should contain at least all fields of the tagging form.
 */
class GeoTag {

    /**
     * @type {number}
     */
    id;

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
     * @param {number} id
     */
    constructor(latitude, longitude, name, hash, id) {
        this.id = id;
        this.latitude = latitude;
        this.longitude = longitude;
        this.name = name;
        hash ? this.hashtag = hash : this.hashtag = "";
    }

    static isValidGeoTag(obj) {
        console.log(typeof obj.hashtag)

        return (
            obj &&
            typeof obj.latitude  === "number" &&
            typeof obj.longitude === "number" &&
            (typeof obj.name     === "string" && obj.name.length <= 10) &&
            (obj.hashtag === undefined || (typeof obj.hashtag  === "string" && obj.hashtag.length <= 11 && obj.hashtag[0] == '#'))
        )
    }

    toString() {
        return `GeoTag: {id=${this.id}, lat=${this.latitude}, lon=${this.longitude}, name="${this.name}", hash="${this.hashtag}"}`;
    }
}

module.exports = GeoTag;

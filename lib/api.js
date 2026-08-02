const axios = require("axios");

async function get(url, options = {}) {
    const { data } = await axios.get(url, options);
    return data;
}

module.exports = {
    get
};

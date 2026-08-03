require("dotenv").config();

module.exports = {

    keys: {
        news: process.env.NEWS_API_KEY || ""
    },

    urls: {
        news: "https://newsdata.io/api/1/latest",
        exchange: "https://open.er-api.com/v6/latest",
        dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
        github: "https://api.github.com",
        npm: "https://registry.npmjs.org",
        lyrics: "https://api.lyrics.ovh/v1"
    }

};

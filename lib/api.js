
require("dotenv").config({ override: true });

module.exports = {

    keys: {
        news: process.env.NEWS_API_KEY || "",
        tmdb: process.env.TMDB_API_KEY || "",
        groq: process.env.GROQ_API_KEY || ""
    },

    urls: {
        news: "https://newsapi.org/v2/top-headlines",
        exchange: "https://open.er-api.com/v6/latest",
        dictionary: "https://api.dictionaryapi.dev/api/v2/entries/en",
        github: "https://api.github.com",
        npm: "https://registry.npmjs.org",
        lyrics: "https://api.lyrics.ovh/v1",
        tmdb: "https://api.themoviedb.org/3",
        groq: "https://api.groq.com/openai/v1"
    }

};

const axios = require("axios");
const { t } = require("../../lib/lang");
const api = require("../../lib/api");

module.exports = {
    name: "movie",
    description: "Search for movie information",
    category: "info",
    permission: "public",
    usage: ".movie <title>",

    execute: async (sock, msg, args) => {

        const jid = msg.key.remoteJid;

        if (!args.length) {
            return sock.sendMessage(jid, {
                text: t(jid, "info.movie_usage")
            });
        }

        const apiKey = api.keys.tmdb;

        if (!apiKey) {
            return sock.sendMessage(jid, {
                text: t(jid, "info.movie_no_api")
            });
        }

        const query = args.join(" ");

        try {

            const { data } = await axios.get(
                `${api.urls.tmdb}/search/movie`,
                {
                    params: {
                        api_key: apiKey,
                        query
                    }
                }
            );

            if (!data.results.length) {
                return sock.sendMessage(jid, {
                    text: t(jid, "info.movie_not_found")
                });
            }

            const movie = data.results[0];

            const poster = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null;

            const text =
`🎬 *${movie.title}*

⭐ Rating: ${movie.vote_average}/10
📅 Release: ${movie.release_date || "Unknown"}

📝 ${movie.overview || t(jid, "info.movie_no_description")}`;

            if (poster) {
                return sock.sendMessage(
                    jid,
                    {
                        image: { url: poster },
                        caption: text
                    },
                    {
                        quoted: msg
                    }
                );
            }

            await sock.sendMessage(
                jid,
                {
                    text
                },
                {
                    quoted: msg
                }
            );

        } catch {

            await sock.sendMessage(jid, {
                text: t(jid, "info.movie_error")
            });

        }

    }
};

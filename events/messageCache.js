const messageCache = require("../lib/editCache");

module.exports = {
    name: "messageCache",

    trigger: "messages.upsert",

    execute: async (sock, msg) => {

        console.log(
            JSON.stringify(msg, null, 2)
        );

        if (!msg.message) return;

        const id = msg.key?.id;

        if (!id) return;

        messageCache.set(id, msg);

    }

};

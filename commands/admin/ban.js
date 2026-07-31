module.exports = {
    name: "ban",
    description: "Ban a user.",

    async execute({ jid, t }) {

        t(jid, "admin.ban_usage");
        t(jid, "admin.ban_success");
        t(jid, "admin.ban_failed");

    }
};

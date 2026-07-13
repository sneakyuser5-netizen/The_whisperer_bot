const settings = require("./settings");

const languages = {
    en: require("../language/generated-en"),
    fr: require("../language/generated-fr")
};
function t(jid, key) {

    const config = settings.get(jid);

    const lang =
        config.language || "en";

    return (
        languages[lang]?.[key] ||
        languages.en[key] ||
        key
    );

}

module.exports = {
    t
};

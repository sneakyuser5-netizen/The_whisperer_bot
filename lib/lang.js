const settings = require("./settings");

const languages = {
    en: require("../language/en"),
    fr: require("../language/fr")
};

function t(key) {

    const global = settings.get("global");

    const lang =
        global.language || "en";

    return (
        languages[lang]?.[key] ||
        languages.en[key] ||
        key
    );

}

module.exports = {
    t
};

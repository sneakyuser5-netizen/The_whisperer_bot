console.log("✅ LANG.JS LOADED");
const settings = require("./settings");

const languages = {
    en: require("../language/en"),
    fr: require("../language/fr")
};

function t(jid, key) {

    const config = settings.get(jid);

    console.log("LANG CONFIG:", config);

    const lang = config.language || "en";

    console.log("LANG:", lang);

    console.log("TRANSLATION:", languages[lang]);

    console.log("KEY:", key);

    console.log("RESULT:", languages[lang]?.[key]);

    return (
        languages[lang]?.[key] ||
        languages.en[key] ||
        key
    );

}

module.exports = {
    t
};

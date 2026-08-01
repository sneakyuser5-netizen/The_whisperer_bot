const fillers = [
    "the",
    "a",
    "an",
    "this",
    "that",
    "private",
    "group",
    "all"
];

const verbs = {

    set: {
        en: "save",
        fr: "enregistrer"
    },

    delete: {
        en: "delete",
        fr: "supprimer"
    },

    remove: {
        en: "remove",
        fr: "supprimer"
    },

    add: {
        en: "add",
        fr: "ajouter"
    },

    create: {
        en: "create",
        fr: "créer"
    },

    ban: {
        en: "ban",
        fr: "bannir"
    },

    kick: {
        en: "remove",
        fr: "expulser"
    },

    promote: {
        en: "promote",
        fr: "promouvoir"
    },

    demote: {
        en: "demote",
        fr: "rétrograder"
    },

    mute: {
        en: "mute",
        fr: "rendre muet"
    },

    unmute: {
        en: "unmute",
        fr: "rétablir la parole à"
    },

    translate: {
        en: "translate",
        fr: "traduire"
    },

    send: {
        en: "send",
        fr: "envoyer"
    },

    lock: {
        en: "lock",
        fr: "verrouiller"
    },

    unlock: {
        en: "unlock",
        fr: "déverrouiller"
    }

};

function infer(description) {

    description = description.replace(/\.$/, "");

    const words = description.split(/\s+/);

    const verb = words.shift().toLowerCase();

    const object = words
        .filter(w => !fillers.includes(w.toLowerCase()))
        .join(" ");

    return {
        verb,
        object,
        action: verbs[verb] || null
    };

}

module.exports = infer;

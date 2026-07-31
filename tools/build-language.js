const fs = require("fs");
const path = require("path");
const verbs = require("../language/source/verbs");
const ROOT = path.join(__dirname, "..");

const COMMANDS = path.join(ROOT, "commands");
const EVENTS = path.join(ROOT, "events");
const LIB = path.join(ROOT, "lib");

const EN = path.join(ROOT, "language/en.js");
const FR = path.join(ROOT, "language/fr.js");
const DICTIONARY = path.join(ROOT, "language/source/dictionary.js");

const en = require(EN);
const fr = require(FR);
const dictionary = require(DICTIONARY);
const templates = require("../language/source/templates");
function normalizeKey(key, foundCommandsSet = new Set()) {

    // Split by both "." and "_"
    const parts = key.split(/[._]/);

    // Choose a command candidate: prefer a part that matches a known command name
    let command = "";
    for (const p of parts) {
        if (foundCommandsSet.has(p)) {
            command = p;
            break;
        }
    }

    // Fallback to second part (existing behavior) or first
    if (!command) command = parts[1] || parts[0] || "";

    const commandIndex = parts.indexOf(command);

    // Action is everything after the selected command
    const actionParts = commandIndex >= 0 ? parts.slice(commandIndex + 1) : parts.slice(2);

    return {
        original: key,
        parts,

        category: parts[0] || "",

        command,

        action: actionParts.join("_"),

        last: parts[parts.length - 1]
    };

}
const foundKeys = new Set();
const foundCommands = new Set();
const commandMeaning = {};
let scanned = 0;
let templateUsed = 0;
let verbRuleUsed = 0;
let fallbackUsed = 0;
let addedEn = 0;
let addedFr = 0;
let addedDesc = 0;

function getFiles(dir) {

    let files = [];

    if (!fs.existsSync(dir)) return files;

    for (const file of fs.readdirSync(dir)) {

        const full = path.join(dir, file);

        if (fs.statSync(full).isDirectory()) {

            files.push(...getFiles(full));

        } else if (file.endsWith(".js")) {

            files.push(full);

        }

    }

    return files;

}

const files = [
    ...getFiles(COMMANDS),
    ...getFiles(EVENTS),
    ...getFiles(LIB)
];

for (const file of files) {

    scanned++;

    const content = fs.readFileSync(file, "utf8");

    // ----------------------------
    // Detect command names
    // ----------------------------

const commandMatch = content.match(
    /module\.exports\s*=\s*{[\s\S]*?name\s*:\s*["']([^"']+)["']/
);

if (commandMatch) {

    foundCommands.add(commandMatch[1]);

} else if (file.includes("/commands/")) {

    console.log(
        "Missing name:",
        file.replace(ROOT + "/", "")
    );

}

    // ----------------------------
    // Detect translation keys
    // ----------------------------

    const regex =
        /t\s*\(\s*(?:[^,]+,\s*)?["'`]([a-zA-Z0-9_.-]+)["'`]\s*\)/g;

    let match;

    while ((match = regex.exec(content)) !== null) {

        foundKeys.add(match[1]);

    }

}

// --------------------------------
// Add missing command descriptions
// --------------------------------

for (const cmd of foundCommands) {

    const file = files.find(f => {

        const content = fs.readFileSync(f, "utf8");

        return content.includes(`name: "${cmd}"`) ||
               content.includes(`name: '${cmd}'`);

    });

    let description = "No description available.";

    if (file) {

        const content = fs.readFileSync(file, "utf8");

        const match = content.match(
            /description\s*:\s*(['\"])(([\s\S]*?))\1/
        );

        if (match) {
            description = match[2].trim();
        }

    }

    // Build commandMeaning for EVERY command
    const action = description
        .replace(/\.$/, "")
        .split(" ")[0]
        .toLowerCase();

    commandMeaning[cmd] = { action };

    // Only update dictionary if missing
    if (!dictionary[cmd]) {

        dictionary[cmd] = description;

        console.log("Added command description:", cmd);

        addedDesc++;

    }

}

// --------------------------------
// Improved auto-generation + confidence
// --------------------------------

const translationConfidence = {};
const needsReview = [];

function humanizeObject(str) {
    if (!str) return "";
    const s = str.replace(/_/g, " ").trim();
    // Lowercase everything then capitalize first letter
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function verbPastTense(verb) {
    // Simple mapping for common verbs. Extend as needed.
    const map = {
        add: 'added',
        create: 'created',
        update: 'updated',
        delete: 'deleted',
        remove: 'removed',
        enable: 'enabled',
        disable: 'disabled',
        set: 'set',
        send: 'sent',
        ban: 'banned',
        unban: 'unbanned',
        kick: 'kicked',
        mute: 'muted',
        unmute: 'unmuted',
        get: 'retrieved',
        show: 'shown',
        list: 'listed'
    };
    return map[verb] || (verb.endsWith('e') ? verb + 'd' : verb + 'ed');
}

function chooseConfidence(level) {
    // level: 'high'|'medium'|'low'
    return level;
}

function buildFromCommonPatterns(last, lang) {
    // returns { text, confidence, reason } or null
    const enMap = {
        '_default': "Use this command with the required information.",
        '_usage': "Shows how to use this command.",
        '_success': "Operation completed successfully.",
        '_failed': "Operation failed.",
        '_enabled': "Feature enabled successfully.",
        '_disabled': "Feature disabled successfully.",
        '_title': "Information",
        '_footer': "End of message.",
        '_mention': "Please mention a user.",
        '_reply': "Reply to a message.",
        '_current': "Current value.",
        '_updated': "Updated successfully.",
        '_invalid': "Invalid option.",
        '_only': "This command cannot be used here.",
        '_empty': "No data found.",
        '_not_found': "No result found.",
        '_required': "This information is required."
    };
    const frMap = {
        '_default': "Utilisez cette commande avec les informations nécessaires.",
        '_usage': "Affiche comment utiliser cette commande.",
        '_success': "Opération réussie.",
        '_failed': "Échec de l'opération.",
        '_enabled': "Fonction activée.",
        '_disabled': "Fonction désactivée.",
        '_title': "Informations",
        '_footer': "Fin du message.",
        '_mention': "Veuillez mentionner un utilisateur.",
        '_reply': "Répondez à un message.",
        '_current': "Valeur actuelle.",
        '_updated': "Mis à jour.",
        '_invalid': "Option invalide.",
        '_only': "Cette commande ne peut pas être utilisée ici.",
        '_empty': "Aucune donnée trouvée.",
        '_not_found': "Aucun résultat trouvé.",
        '_required': "Cette information est requise."
    };
    for (const suffix of Object.keys(enMap)) {
        if (last.endsWith(suffix)) {
            return {
                text: lang === 'fr' ? frMap[suffix] : enMap[suffix],
                confidence: chooseConfidence('low'),
                reason: 'common-pattern'
            };
        }
    }
    return null;
}

const specialEn = {
    hidetag_default: "Attention everyone.",
    tagall_title: "Everyone",
    tagadmins_title: "Group administrators",
    admin_count_message: "Total number of administrators.",
    group_admins_title: "Group Administrators",
    admin_membercount_total: "Total members.",
    admin_only_groups: "This command can only be used in groups.",
    admin_invalid_option: "Invalid option selected.",
    group_closed: "The group has been closed.",
    group_opened: "The group has been opened.",
    admin_welcome_enabled: "Welcome messages enabled.",
    admin_welcome_disabled: "Welcome messages disabled."
};
const specialFr = {
    hidetag_default: "Attention à tous.",
    tagall_title: "Tout le monde",
    tagadmins_title: "Administrateurs du groupe",
    admin_count_message: "Nombre total d'administrateurs.",
    group_admins_title: "Administrateurs du groupe",
    admin_membercount_total: "Nombre total de membres.",
    admin_only_groups: "Cette commande fonctionne uniquement dans les groupes.",
    admin_invalid_option: "Option invalide.",
    group_closed: "Le groupe est maintenant fermé.",
    group_opened: "Le groupe est maintenant ouvert.",
    admin_welcome_enabled: "Les messages de bienvenue sont activés.",
    admin_welcome_disabled: "Les messages de bienvenue sont désactivés."
};

function humanFallback(last, lang) {
    // last: the key (or last part), like admin_count_message
    const words = last.split("_");
    const action = words.pop();
    const object = words.join(" ");
    const humanObj = object.replace(/_/g, " ");

    const enActions = {
        usage: `Usage: ${humanObj}.`,
        success: `${humanObj} completed successfully.`,
        failed: `Failed to ${humanObj}.`,
        enabled: `${humanObj} enabled.`,
        disabled: `${humanObj} disabled.`,
        updated: `${humanObj} updated.`,
        deleted: `${humanObj} deleted.`,
        added: `${humanObj} added.`,
        removed: `${humanObj} removed.`
    };
    const frActions = {
        usage: `Utilisation : ${humanObj}.`,
        success: `${humanObj} effectué avec succès.`,
        failed: `Impossible de ${humanObj}.`,
        enabled: `${humanObj} activé.`,
        disabled: `${humanObj} désactivé.`,
        updated: `${humanObj} mis à jour.`,
        deleted: `${humanObj} supprimé.`,
        added: `${humanObj} ajouté.`,
        removed: `${humanObj} retiré.`
    };

    if (lang === 'fr') {
        if (frActions[action]) return { text: frActions[action], confidence: chooseConfidence('low'), reason: 'pattern-fallback' };
    } else {
        if (enActions[action]) return { text: enActions[action], confidence: chooseConfidence('low'), reason: 'pattern-fallback' };
    }

    // Generic humanized fallback
    const genericEn = humanizeObject(last);
    const genericFr = humanizeObject(last); // not ideal but better than raw key

    return {
        text: lang === 'fr' ? genericFr : genericEn,
        confidence: chooseConfidence('low'),
        reason: 'generic-fallback'
    };
}

function buildTranslation(key, lang) {
    // Try templates first
    const tpl = getTemplate(key, lang);
    if (tpl) {
        templateUsed++;
        return { text: tpl, confidence: chooseConfidence('high'), reason: 'template' };
    }

    const info = normalizeKey(key, foundCommands);

    // Try verb rules if commandMeaning exists
    const meaning = commandMeaning[info.command];
    if (meaning && verbs[meaning.action]) {
        const verbMap = verbs[meaning.action][lang];
        if (verbMap && verbMap[info.action]) {
            verbRuleUsed++;
            return { text: verbMap[info.action], confidence: chooseConfidence('medium'), reason: 'verb-rule' };
        }
    }

    // common patterns
    const last = key;
    const common = buildFromCommonPatterns(last, lang);
    if (common) {
        fallbackUsed++;
        return common;
    }

    // special keys
    if (lang === 'fr') {
        if (specialFr[last]) return { text: specialFr[last], confidence: chooseConfidence('medium'), reason: 'special' };
    } else {
        if (specialEn[last]) return { text: specialEn[last], confidence: chooseConfidence('medium'), reason: 'special' };
    }

    // humanized action/object fallback
    const human = humanFallback(info.last, lang);
    fallbackUsed++;
    return human;
}

function getTemplate(key, lang) {

    const info = normalizeKey(key, foundCommands);

    // Try command + action
    if (
        templates[info.command] &&
        templates[info.command][info.action]
    ) {
        templateUsed++;
        return templates[info.command][info.action][lang];
    }

    // Try full key (future support)
    if (templates[key]) {
        templateUsed++;
        return templates[key][lang];
    }

    return null;

}

function sortObject(obj) {

    return Object.fromEntries(
        Object.entries(obj).sort((a, b) =>
            a[0].localeCompare(b[0])
        )
    );

}

// --------------------------------
// Add missing translation keys using new generator
// --------------------------------

for (const key of foundKeys) {
    if (!en[key]) {
        const result = buildTranslation(key, 'en');
        en[key] = result.text;
        translationConfidence[key] = translationConfidence[key] || {};
        translationConfidence[key].en = { confidence: result.confidence, reason: result.reason };
        addedEn++;
    }

    if (!fr[key]) {
        const result = buildTranslation(key, 'fr');
        fr[key] = result.text;
        translationConfidence[key] = translationConfidence[key] || {};
        translationConfidence[key].fr = { confidence: result.confidence, reason: result.reason };
        addedFr++;
    }

    // Collect needs review items (low confidence)
    const conf = translationConfidence[key];
    if (conf && ((conf.en && conf.en.confidence === 'low') || (conf.fr && conf.fr.confidence === 'low'))) {
        needsReview.push({
            key,
            en: conf.en ? en[key] : null,
            fr: conf.fr ? fr[key] : null,
            confidence: {
                en: conf.en ? conf.en.confidence : null,
                fr: conf.fr ? conf.fr.confidence : null
            },
            reasons: {
                en: conf.en ? conf.en.reason : null,
                fr: conf.fr ? conf.fr.reason : null
            }
        });
    }
}

// Persist dictionary and language files
fs.writeFileSync(
    DICTIONARY,
    "module.exports = " +
    JSON.stringify(sortObject(dictionary), null, 2) +
    ";\n"
);

fs.writeFileSync(
    EN,
    "module.exports = " +
    JSON.stringify(sortObject(en), null, 2) +
    ";\n"
);

fs.writeFileSync(
    FR,
    "module.exports = " +
    JSON.stringify(sortObject(fr), null, 2) +
    ";\n"
);

// Write needs_review.json for maintainers
const needsPath = path.join(ROOT, 'language', 'needs_review.json');
fs.writeFileSync(needsPath, JSON.stringify(needsReview.sort((a,b)=>a.key.localeCompare(b.key)), null, 2) + '\n');

console.log("\n══════════════════════════════");
console.log(" WhisperBot Language Builder ");
console.log("══════════════════════════════");

console.log(`Files scanned        : ${scanned}`);
console.log(`Commands found       : ${foundCommands.size}`);
console.log(`Translation keys     : ${foundKeys.size}`);

console.log("");

console.log(`Descriptions added   : ${addedDesc}`);
console.log(`English keys added   : ${addedEn}`);
console.log(`French keys added    : ${addedFr}`);
console.log("");
console.log("══════════════════════════════");
console.log(" Builder Report");
console.log("══════════════════════════════");

console.log(`Commands processed : ${foundCommands.size}`);
console.log(`Templates used     : ${templateUsed}`);
console.log(`Verb rules used    : ${verbRuleUsed}`);
console.log(`Fallback generated : ${fallbackUsed}`);

const manual =
    foundKeys.size -
    templateUsed -
    verbRuleUsed -
    fallbackUsed;

console.log(`Manual translations: ${manual > 0 ? manual : 0}`);
console.log("");
if (
    addedDesc === 0 &&
    addedEn === 0 &&
    addedFr === 0
) {

    console.log("\n✅ Everything is up to date.");

} else {

    console.log("\n✅ Language files updated.");

}

if (needsReview.length > 0) {
    console.log('\n⚠️  Needs review: ' + needsReview.length + ' keys written to language/needs_review.json');
} else {
    console.log('\nNo low-confidence translations detected.');
}




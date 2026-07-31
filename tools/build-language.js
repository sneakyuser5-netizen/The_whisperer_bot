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
function normalizeKey(key) {

    // Split by both "." and "_"
    const parts = key.split(/[._]/);

    return {
        original: key,
        parts,

        category: parts[0] || "",

        command: parts[1] || "",

        action: parts.slice(2).join("_"),

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


let addedEn = 0;
let addedFr = 0;
let addedDesc = 0;

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
            /description\s*:\s*["'`]([^"'`]+)["'`]/
        );

        if (match) {
            description = match[1];
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
// Add missing translation keys
// --------------------------------


function autoEnglish(key) {
const last = key;
const info = normalizeKey(key);
const meaning = commandMeaning[info.command];
if (meaning && verbs[meaning.action]) {

    const verb = verbs[meaning.action].en;

    if (verb[info.action]) {
verbRuleUsed++;
return verb[info.action];
    }

}
// Smart command sentences
if (meaning) {
    // Verb not found in verbs.js.
    // Continue to generic fallback below.
}
// ---------- Common patterns ----------
// Default messages
if (last.endsWith("_default"))
    return "Use this command with the required information.";
if (last.endsWith("_usage"))
    return "Shows how to use this command.";

if (last.endsWith("_success"))
    return "Operation completed successfully.";

if (last.endsWith("_failed"))
    return "Operation failed.";

if (last.endsWith("_enabled"))
    return "Feature enabled successfully.";

if (last.endsWith("_disabled"))
    return "Feature disabled successfully.";

if (last.endsWith("_title"))
    return "Information";

if (last.endsWith("_footer"))
    return "End of message.";

if (last.endsWith("_mention"))
    return "Please mention a user.";

if (last.endsWith("_reply"))
    return "Reply to a message.";

if (last.endsWith("_current"))
    return "Current value.";

if (last.endsWith("_updated"))
    return "Updated successfully.";

if (last.endsWith("_invalid"))
    return "Invalid option.";

if (last.endsWith("_only"))
    return "This command cannot be used here.";
if (last.endsWith("_empty"))
    return "No data found.";

if (last.endsWith("_not_found"))
    return "No result found.";

if (last.endsWith("_required"))
    return "This information is required.";

if (last.endsWith("_invalid"))
    return "Invalid option.";
const special = {
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

if (special[last]) return special[last];
if (special[last]) {
    return special[last];
}

    const words = last.split("_");
if (key === "admin_count_message") {
    console.log("KEY =", key);
    console.log("LAST =", last);
}

    const action = words.pop();

    const object = words.join(" ");

    const actions = {

        usage: `Usage: ${object}.`,

        success: `${object} completed successfully.`,

        failed: `Failed to ${object}.`,

        enabled: `${object} enabled.`,

        disabled: `${object} disabled.`,

        updated: `${object} updated.`,

        deleted: `${object} deleted.`,

        added: `${object} added.`,

        removed: `${object} removed.`

    };

    if (actions[action])

        return actions[action];

fallbackUsed++;
return last.replace(/_/g, " ");
}

function autoFrench(key) {
const last = key;
const info = normalizeKey(key);

const meaning = commandMeaning[info.command];
if (meaning && verbs[meaning.action]) {

    const verb = verbs[meaning.action].fr;

    if (verb[info.action]) {
verbRuleUsed++;
return verb[info.action];
    }

}
if (meaning) {
    // Verb not found in verbs.js.
    // Continue to generic fallback below.
}
// Default messages
if (last.endsWith("_default"))
    return "Utilisez cette commande avec les informations nécessaires.";
if (last.endsWith("_usage"))
    return "Affiche comment utiliser cette commande.";

if (last.endsWith("_success"))
    return "Opération réussie.";

if (last.endsWith("_failed"))
    return "Échec de l'opération.";

if (last.endsWith("_enabled"))
    return "Fonction activée.";

if (last.endsWith("_disabled"))
    return "Fonction désactivée.";

if (last.endsWith("_title"))
    return "Informations";

if (last.endsWith("_footer"))
    return "Fin du message.";

if (last.endsWith("_mention"))
    return "Veuillez mentionner un utilisateur.";

if (last.endsWith("_reply"))
    return "Répondez à un message.";

if (last.endsWith("_current"))
    return "Valeur actuelle.";

if (last.endsWith("_updated"))
    return "Mis à jour.";

if (last.endsWith("_invalid"))
    return "Option invalide.";

if (last.endsWith("_only"))
    return "Cette commande ne peut pas être utilisée ici.";
if (last.endsWith("_empty"))
    return "Aucune donnée trouvée.";

if (last.endsWith("_not_found"))
    return "Aucun résultat trouvé.";

if (last.endsWith("_required"))
    return "Cette information est requise.";

if (last.endsWith("_invalid"))
    return "Option invalide.";
const special = {
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

if (special[last]) return special[last];

if (special[last]) {
    return special[last];
}

    const words = last.split("_");

    const action = words.pop();

    const object = words.join(" ");

    const actions = {

        usage: `Utilisation : ${object}.`,

        success: `${object} effectué avec succès.`,

        failed: `Impossible de ${object}.`,

        enabled: `${object} activé.`,

        disabled: `${object} désactivé.`,

        updated: `${object} mis à jour.`,

        deleted: `${object} supprimé.`,

        added: `${object} ajouté.`,

        removed: `${object} retiré.`

    };

    if (actions[action])

        return actions[action];

fallbackUsed++;
return last.replace(/_/g, " ");
}



for (const key of foundKeys) {
    if (!en[key]) {

if (key === "admin_count_message") {
    console.log("FOUND KEY:", key);
}
        en[key] =
            getTemplate(key, "en") ||
            autoEnglish(key);

        addedEn++;

    }

    if (!fr[key]) {

        fr[key] =
            getTemplate(key, "fr") ||
            autoFrench(key);

        addedFr++;

    }

}
function getTemplate(key, lang) {

    const info = normalizeKey(key);

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






const OpenAI = require("openai");
const settings = require("../lib/settings");
const { keys } = require("../lib/api");
const identity = require("../lib/identity");
const { t } = require("../lib/lang");

const client = keys.groq? new OpenAI({ apiKey: keys.groq, baseURL: "https://api.groq.com/openai/v1" }) : null;
const MODEL = "openai/gpt-oss-120b";
const warns = {};

function getText(msg) {
    const m = msg?.message;
    if (!m) return "";
    return (m.conversation || m.extendedTextMessage?.text || m.imageMessage?.caption || m.videoMessage?.caption || "").trim();
}
function fallbackCategory(v) {
    v=v.toLowerCase();
    if (/(kill you|i will kill|murder|i go kill|i go beat|hurt you)/i.test(v)) return "threat";
    if (/(nudes|porn|xxx|pussy|dick pic|sex chat)/i.test(v)) return "sexual";
    if (/(send money|free money|crypto double)/i.test(v)) return "scam";
    if (/(fuck|shit|bitch|asshole|bastard|idiot|stupid|fool|mugu|mumu|ode|olosho|fou|imbecile|con|pute|salope|nique|yab|rubbish|useless|shut up)/i.test(v)) return "harassment";
    return "safe";
}
async function classify(text) {
    if (!client) return fallbackCategory(text);
    try {
        const r = await client.chat.completions.create({
            model: MODEL, temperature: 0, max_tokens: 10,
            messages: [
                { role: "system", content: `STRICT MODERATOR. ONE word: safe, toxic, harassment, threat, scam, sexual. harassment=any insult/swear/mockery/yab. toxic=rude. If rude at all->harassment. Only 100% respectful=safe.` },
                { role: "user", content: text.slice(0,1000) }
            ]
        });
        const cat = r.choices?.[0]?.message?.content?.trim().toLowerCase().split(/\s+/)[0];
        const allowed=["safe","toxic","harassment","scam","sexual","threat"];
        let final=allowed.includes(cat)?cat:fallbackCategory(text);
        if(final==="safe"&&fallbackCategory(text)!=="safe") final=fallbackCategory(text);
        return final;
    } catch { return fallbackCategory(text); }
}

module.exports = {
    name: "aifilter", trigger: "messages.upsert",
    execute: async (sock, msg) => {
        const jid = msg?.key?.remoteJid;
        if (!jid || msg?.key?.fromMe ||!jid.endsWith("@g.us")) return;
        const text=getText(msg);
        if (!text || text.startsWith(".")) return;
        if (!settings.get(jid).aifilter) return;

        const category=await classify(text);
        if (category==="safe") return;

        const sender=identity.normalize(identity.getSender(msg));
        if(!warns[jid]) warns[jid]={};
        if(!warns[jid][sender]) warns[jid][sender]=0;
        warns[jid][sender]+=1;
        const count=warns[jid][sender];

        try {
            await sock.sendMessage(jid,{delete:msg.key});

            const reasonKey=`tools.aifilter_reason_${category}`;
            const reasonText=t(jid, reasonKey);

            if(count<3){
                await sock.sendMessage(jid,{
                    text: `${reasonText}\n\n@${sender.split("@")[0]} ${t(jid,"tools.aifilter_deleted")}\n*${t(jid,"tools.aifilter_reason_label")}:* ${category}\n*${t(jid,"tools.aifilter_warning")}:* ${count}/3\n\n_${t(jid,"tools.aifilter_keep_respectful")}_`,
                    mentions:[sender]
                });
            } else {
                await sock.sendMessage(jid,{
                    text: `❌ @${sender.split("@")[0]} ${t(jid,"tools.aifilter_kicked")}\n${t(jid,"tools.aifilter_reason_label")}: ${reasonText}\n${t(jid,"tools.aifilter_last_msg")}: "${text.slice(0,80)}"`,
                    mentions:[sender]
                });
                try{await sock.groupParticipantsUpdate(jid,[sender],"remove");}catch{}
                warns[jid][sender]=0;
            }
        } catch(e){console.log("[AIFILTER]",e.message)}
    }
};

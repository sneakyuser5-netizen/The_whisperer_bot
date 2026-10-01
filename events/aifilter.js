const OpenAI = require("openai");
const settings = require("../lib/settings");
const { keys } = require("../lib/api");
const identity = require("../lib/identity");
const { t } = require("../lib/lang");
const { isGroupAdmin } = require("../lib/group-admin");

const client = keys.groq? new OpenAI({ apiKey: keys.groq, baseURL: "https://api.groq.com/openai/v1" }) : null;
const MODEL = "openai/gpt-oss-120b";
const warns = {};

function getText(msg){
    const m=msg?.message;
    if(!m) return "";
    return (m.conversation||m.extendedTextMessage?.text||m.imageMessage?.caption||m.videoMessage?.caption||"").trim();
}
function fallbackCategory(v){
    v=v.toLowerCase();
    if(/(kill you|i will kill|murder|i go kill|i go beat|hurt you)/i.test(v)) return "threat";
    if(/(nudes|porn|xxx|pussy|dick pic|sex chat)/i.test(v)) return "sexual";
    if(/(send money|free money|crypto double)/i.test(v)) return "scam";
    if(/(fuck|shit|bitch|asshole|bastard|idiot|stupid|fool|mugu|mumu|ode|olosho|fou|imbecile|con|pute|salope|nique|yab|rubbish|useless|shut up|getout|get out)/i.test(v)) return "harassment";
    return "safe";
}
async function classify(text){
    if(!client) return fallbackCategory(text);
    try{
        const r=await client.chat.completions.create({
            model:MODEL,temperature:0,max_tokens:10,
            messages:[
                {role:"system",content:`STRICT MODERATOR. ONE word: safe, toxic, harassment, threat, scam, sexual. harassment=any insult/swear/mockery/yab/shade. If rude at all->harassment. Only 100% respectful=safe.`},
                {role:"user",content:text.slice(0,1000)}
            ]
        });
        const cat=r.choices?.[0]?.message?.content?.trim().toLowerCase().split(/\s+/)[0];
        const allowed=["safe","toxic","harassment","scam","sexual","threat"];
        let final=allowed.includes(cat)?cat:fallbackCategory(text);
        if(final==="safe"&&fallbackCategory(text)!=="safe") final=fallbackCategory(text);
        return final;
    }catch{return fallbackCategory(text);}
}

module.exports={
    name:"aifilter",trigger:"messages.upsert",
    execute: async (sock,msg)=>{
        const jid=msg?.key?.remoteJid;
        if(!jid||msg?.key?.fromMe||!jid.endsWith("@g.us")) return;
        const text=getText(msg);
        if(!text||text.startsWith(".")) return;
        if(!settings.get(jid).aifilter) return;

        const category=await classify(text);
        if(category==="safe") return;

        const rawSender = msg.key.participant || msg.participant || identity.getSender(msg);
        const senderJid = identity.normalize(rawSender);
        const tag = `@${senderJid.split("@")[0]}`;

        if(!warns[jid]) warns[jid]={};
        if(!warns[jid][senderJid]) warns[jid][senderJid]=0;
        warns[jid][senderJid]+=1;
        const count=warns[jid][senderJid];

        const reasonText=t(jid,`tools.aifilter_reason_${category}`);

        try{
            await sock.sendMessage(jid,{delete:msg.key});

            if(count<3){
                await sock.sendMessage(jid,{
                    text:`${reasonText}\n\n${tag} ${t(jid,"tools.aifilter_deleted")}\n*${t(jid,"tools.aifilter_reason_label")}:* ${category}\n*${t(jid,"tools.aifilter_warning")}:* ${count}/3\n\n_${t(jid,"tools.aifilter_keep_respectful")}_`,
                    mentions:[senderJid]
                });
            }else{
                await sock.sendMessage(jid,{
                    text:`❌ ${tag} ${t(jid,"tools.aifilter_kicked")}\n${t(jid,"tools.aifilter_reason_label")}: ${reasonText}\n${t(jid,"tools.aifilter_last_msg")}: "${text.slice(0,80)}"`,
                    mentions:[senderJid]
                });
                try{
                    await sock.groupParticipantsUpdate(jid,[senderJid],"remove");
                    console.log(`[AIFILTER] KICKED ${senderJid}`);
                }catch(kickErr){
                    console.log(`[AIFILTER] KICK FAILED:`,kickErr.message);
                    await sock.sendMessage(jid,{
                        text:`${tag} ${t(jid,"tools.aifilter_not_admin")}`,
                        mentions:[senderJid]
                    });
                }
                warns[jid][senderJid]=0;
            }
        }catch(e){console.log("[AIFILTER] fail",e.message)}
    }
};

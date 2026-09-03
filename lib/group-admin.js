function normalize(value) {
    if (!value) return "";

    return String(value)
        .trim()
        .toLowerCase()
        .replace(/:\d+@/, "@");
}

function sameIdentity(a, b) {
    if (!a || !b) return false;

    const x = normalize(a);
    const y = normalize(b);

    if (x === y) return true;

    const xu = x.split("@")[0];
    const yu = y.split("@")[0];

    return xu === yu;
}

function getSenderCandidates(msg) {
    const key = msg?.key || {};

    return [
        key.participant,
        key.participantAlt,
        key.participantPn,
        key.senderPn,
        msg?.participant,
        msg?.participantAlt
    ].filter(Boolean);
}

async function isGroupAdmin(sock, msg) {
    const jid = msg?.key?.remoteJid;

    if (!jid || !jid.endsWith("@g.us")) {
        return false;
    }

    try {
        const metadata = await sock.groupMetadata(jid);
        const participants = metadata?.participants || [];

        const senders = getSenderCandidates(msg);

        return participants.some(participant => {
            if (!participant?.admin) return false;

            const identities = [
                participant.id,
                participant.jid,
                participant.lid,
                participant.phoneNumber,
                participant.phone,
                participant.idAlt
            ].filter(Boolean);

            return senders.some(sender =>
                identities.some(identity =>
                    sameIdentity(sender, identity)
                )
            );
        });
    } catch (err) {
        console.error("Group admin check error:", err.message);
        return false;
    }
}

module.exports = {
    isGroupAdmin
};

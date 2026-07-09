module.exports = {

    name: "joke",

    description: "Get a random funny joke",

    category: "fun",

    permission: "all",

    execute: async (sock, msg) => {

        const jid = msg.key.remoteJid;

        const jokes = [

            "😂 Why did the computer go to the doctor? Because it had a virus!",

            "🤣 I told my phone I needed a break... now it keeps showing me vacation ads.",

            "😂 Why don't programmers like nature? Too many bugs.",

            "🤣 My WiFi and I have a relationship... sometimes it connects, sometimes it disappears.",

            "😂 Why was the math book sad? Because it had too many problems.",

            "🤣 I asked my dog what's two minus two. He said nothing.",

            "😂 My battery lasts longer than some friendships.",

            "🤣 I tried to make a joke about a broken pencil... but it was pointless."
        ];


        const joke =
            jokes[Math.floor(Math.random() * jokes.length)];


        await sock.sendMessage(jid, {
            text:
`🤡 *JOKE TIME*

${joke}

😂 Hope that made you smile!`
        });

    }

};

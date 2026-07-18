module.exports = {
    name: "debugUpdate",
    trigger: "messages.update",

    execute: async (...args) => {
        console.log(
            JSON.stringify(args, null, 2)
        );
    }
};

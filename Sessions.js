
function EventHandler(event) {
    console.log("Sessions", event);
};
process.on("message", EventHandler);
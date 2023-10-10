"use strict";
const cluster = require('cluster');
if (cluster.isMaster) {
    const { readFileSync } = require('fs');
    const { createServer } = require("https");
    const { Server } = require("socket.io");
    const { serialize } = require("cookie");

    const httpsServer = createServer({
        key: readFileSync('../../CERT/localhost-decrypted.key'),
        cert: readFileSync('../../CERT/localhost.crt')
    });

    const io = new Server(httpsServer, {
        path: "/Grantoria/",
        serveClient: false,
        transports: ["websocket"],
        allowRequest: async function(req, callback) {
            let session = await SessionHandler(req);
            req.session = session;
            console.log("Passing session", session)
            callback(null, true);
        }
    });

    var Loop = (function(){
        function CreateLoop() {
            let worker = cluster.fork({ role: "./loop.js" });
            worker.on("message", (object) => {
                console.log(object);
            });
            worker.on("exit", (worker, code, signal) => {
                Loop = CreateLoop();
            });
        }
        return CreateLoop();
    })();
    
    async function SessionHandler(req) {
        return new Promise((resolve, reject) => {

        })
    }
    io.engine.on("initial_headers", (headers, req) => {
        if (req.session)
            headers["set-cookie"] = serialize("sid", req.session.id, { sameSite: "strict" });
    });
    io.on("connection", (client) => {
        
    });

    httpsServer.listen(443, () => {
        console.log("Grantoria listening on port 443");
    });
} else require(process.env.role);
"use strict";
const cluster = require("cluster");
const { randomUUID } = require("crypto");
if (cluster.isMaster) {
    const { readFileSync } = require("fs");
    const { createServer } = require("https");
    const { Server } = require("socket.io");
    const EventEmitter = require("events");
    const { serialize } = require("cookie");

    const httpsServer = createServer({
        key: readFileSync("../../CERT/localhost-decrypted.key"),
        cert: readFileSync("../../CERT/localhost.crt")
    });

    const io = new Server(httpsServer, {
        path: "/Grantoria/",
        serveClient: false,
        transports: ["websocket"],
        allowRequest: async function(req, cb) {
            console.log(req.socket.address())
            req.socket.on("close", ()=>{
                console.log("Session closed.");
            });
            cb(null, true);
        }
    });

    var GameLoop = (function(){
        function GameLoopWorker() {
            let worker = cluster.fork({ role: "./GameLoop.js" });
            worker.on("message", GameEventHandler);
            worker.on("exit", (worker, code, signal) => {
                console.log("Worker", worker, "exited with code", code, "and signal", signal);
                GameLoop = GameLoopWorker();
            });
            return worker;
        }
        return GameLoopWorker();
    })();
    function GameEventHandler( event ) {
        switch( event.type ) {
            case "tick": console.log("Tick", event); break;
            default: console.error("Unknown event type");
        }
    }

    var Session = (function(){
        function SessionWorker() {
            let worker = cluster.fork({ role: "./Sessions.js" });
            worker.on("message", SessionEventHandler);
            worker.on("exit", (worker, code, signal) => {
                console.log("Worker", worker, "exited with code", code, "and signal", signal);
                Session = SessionWorker();
            });
            return worker;
        }
        return SessionWorker();
    })();
    const Sessions = {};
    function SessionEventHandler(event) {
        switch (event.type) {
            case "SessionLoaded": console.log("Session:", event); break;
            default: console.error("Unknown event type");
        }
    };
    
    io.engine.on("initial_headers", (headers, req) => {
        if (req.session)
            headers["set-cookie"] = serialize("sid", req.session.id, { sameSite: "strict" });
    });
    io.on("connection", (client) => {
        
    });

    httpsServer.listen(443, "localhost", () => {
        console.log("Grantoria listening on port 443");
    });
} else require(process.env.role);
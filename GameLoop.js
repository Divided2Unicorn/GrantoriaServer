const _Metrics = {
    Start: Date.now(),
    Next: Date.now(),
    Second: Date.now(),
    Tick: 0,
    Ticks: 0,
}

const Map = {};
const Tasks = [];

function EventHandler(event) {
    console.log("GameLoop", event);
};
process.on("message", EventHandler);

function Tick() {
    let now = Date.now();
    if (now - _Metrics.Second >= 1000) {
        console.log("Metrics: " + _Metrics.Tick + " tps");
        _Metrics.Tick = 0;
        _Metrics.Second += 1000;
    }
    if (now - _Metrics.Next >= 125) {
        _Metrics.Next += 125;
        _Metrics.Tick++;
        _Metrics.Ticks++;
    }
    setImmediate(Tick);
};
setImmediate(Tick);
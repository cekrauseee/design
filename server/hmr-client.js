// Design Preview — HMR client
// Injected into HTML files served by the preview server from workspace/.
// Handles: live reload via WebSocket, console forwarding, auto-reconnect.

(function () {
  var ws;
  var reconnectDelay = 500;

  function connect() {
    ws = new WebSocket("ws://" + location.host);
    ws.onopen = function () { reconnectDelay = 500; };
    ws.onmessage = function (e) {
      var msg;
      try { msg = JSON.parse(e.data); } catch (_) { return; }
      // Inside the preview iframe: do nothing. The parent shell listens to
      // its own WebSocket and decides whether to mark the reload pill pending
      // based on which file changed. Standalone pages still hot-reload.
      if (msg.type === "reload" && window.parent === window) {
        location.reload();
      }
    };
    ws.onclose = function () {
      setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 1.5, 5000);
    };
  }

  function post(payload) {
    try {
      navigator.sendBeacon("/__log__", JSON.stringify(payload));
    } catch (_) {}
  }

  window.addEventListener("error", function (e) {
    post({ type: "error", message: e.message, source: e.filename, line: e.lineno, ts: Date.now() });
  });

  window.addEventListener("unhandledrejection", function (e) {
    post({ type: "rejection", reason: String(e.reason), ts: Date.now() });
  });

  // Warnings we drop entirely (noisy and not actionable in a prototype):
  //   - Babel standalone's "you are using the in-browser transformer" notice
  var SILENCE = [
    /in-browser Babel transformer.*precompile/i,
  ];
  function silenced(args) {
    if (!args.length) return false;
    var first = args[0];
    if (typeof first !== "string") return false;
    for (var i = 0; i < SILENCE.length; i++) {
      if (SILENCE[i].test(first)) return true;
    }
    return false;
  }

  var origLog = console.log;
  var origWarn = console.warn;
  var origError = console.error;

  console.log = function () {
    origLog.apply(console, arguments);
    post({ type: "log", args: Array.from(arguments).map(String), ts: Date.now() });
  };
  console.warn = function () {
    if (silenced(arguments)) return;
    origWarn.apply(console, arguments);
    post({ type: "warn", args: Array.from(arguments).map(String), ts: Date.now() });
  };
  console.error = function () {
    origError.apply(console, arguments);
    post({ type: "error", args: Array.from(arguments).map(String), ts: Date.now() });
  };

  connect();
})();

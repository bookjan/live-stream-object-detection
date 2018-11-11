const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const path = require("path");
const ngrok = require("ngrok");

const { server } = require("./utils/config");

// Store project base path
global.__basedir = __dirname;

// App parameters
const app = express();
app.set("port", server.httpPort);
app.use(express.static(path.join(__dirname, "public")));

// View engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// Random public URL created by ngrok, default is localhost
let ngrokHttpUrl = `http://localhost:${server.httpPort}`;
let ngrokWsUrl = `ws://localhost:${server.httpPort}`;

// HTTP server
const httpServer = http.createServer(app);
httpServer.listen(app.get("port"), "0.0.0.0", function() {
  console.log("HTTP server listening on port " + app.get("port"));
});

app.get("/", function(req, res) {
  res.render("index", { title: "Live Object Detection", url: ngrokWsUrl }); //render index.html and interpolate the url constiable
});

// Websocket server
const socketServer = new WebSocket.Server({ server: httpServer });

socketServer.connectionCount = 0;

socketServer.on("connection", function(socket, upgradeReq) {
  socketServer.connectionCount++;

  console.log(
    `New WebSocket Connection: 
    ${(upgradeReq || socket.upgradeReq).socket.remoteAddress}
    ${(upgradeReq || socket.upgradeReq).headers["user-agent"]}
    (${socketServer.connectionCount} total)`
  );

  socket.on("close", function(code, message) {
    socketServer.connectionCount--;
    console.log(
      "Disconnected WebSocket (" + socketServer.connectionCount + " total)"
    );
  });
});

socketServer.broadcast = function(data) {
  socketServer.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

// HTTP Server to accept incomming local MPEG-TS Stream from ffmpeg
const streamServer = http
  .createServer(function(request, response) {
    const params = request.url.substr(1).split("/");

    if (params[0] !== server.streamSecret) {
      console.log(
        `Failed Stream Connection: 
        ${request.socket.remoteAddress}:${request.socket.remotePort}`
      );
      response.end();
    }

    response.connection.setTimeout(0);

    console.log(
      `Stream Connected: 
      ${request.socket.remoteAddress}:${request.socket.remotePort}`
    );

    request.on("data", function(data) {
      socketServer.broadcast(data);
      if (request.socket.recording) {
        request.socket.recording.write(data);
      }
    });

    request.on("end", function() {
      console.log("close");
      if (request.socket.recording) {
        request.socket.recording.close();
      }
    });
  })
  .listen(server.streamPort);

// Start generate streaming
require("./utils/stream")();

// Get ngrok url for local server
(async function() {
  // IIFE: Immediately Invoked Function Expression
  ngrokHttpUrl = await ngrok.connect(server.httpPort);
  ngrokWsUrl = ngrokHttpUrl.toString().replace(/^https?:\/\//, "wss://");

  console.log("ngrokHttpUrl", ngrokHttpUrl);
  console.log("ngrokWsUrl", ngrokWsUrl);
})().catch(error => console.log(error.message));

module.exports.app = app;

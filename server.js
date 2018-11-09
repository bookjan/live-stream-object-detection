const express = require("express");
const http = require("http");
const path = require("path");
const ngrok = require("ngrok");

const { server } = require("./utils/config");

// Store project base path
global.__basedir = __dirname;

// app parameters
const app = express();
app.set("port", server.port);
app.use(express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

//random public URL created by ngrok, default is localhost
let ngrokURL = `http://localhost:${app.get("port")}`;

// HTTP server
const httpServer = http.createServer(app);
httpServer.listen(app.get("port"), "0.0.0.0", function() {
  console.log("HTTP server listening on port " + app.get("port"));
});

// Websocket server
const io = require("socket.io")(httpServer);

// serve index
app.get("/", function(req, res) {
  res.render("index", { title: "face detection", url: ngrokURL }); //render index.html and interpolate the url constiable
});

//ffmpeg pushed stream in here to make a pipe
app.all("/streamIn/:feed", function(req, res) {
  //req.params.feed = Feed Number (Pipe Number)

  console.log("feed", req.params.feed);

  res.connection.setTimeout(0); //keeps the connection open indefinitely

  req.on("data", function(buffer) {
    io.to("STREAM_" + req.params.feed).emit("h264", {
      feed: req.params.feed,
      buffer: buffer
    });
  });

  req.on("end", function() {
    console.log("close");
  });
});

//socket.io client commands
io.on("connection", function(cn) {
  cn.on("f", function(data) {
    switch (data.function) {
      case "getStream":
        console.log(data);
        cn.join("STREAM_" + data.feed);
        break;
    }
  });
});

// Start generate Streaming
require(`${__basedir}/utils/stream`)();

// Get ngrok url
// (async function() {
//   // IIFE: Immediately Invoked Function Expression
//   ngrokURL = await ngrok.connect(app.get("port"));
//   console.log("ngrokURL", ngrokURL);
// })();

module.exports.app = app;

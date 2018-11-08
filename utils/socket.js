const { fork } = require("child_process");

const detection = fork(`${__basedir}/utils/detection.js`);

const socket = socket => {
  detection.on("message", function (msg) {
    socket.emit("frame", { base64: msg });
  });
};

module.exports = socket;

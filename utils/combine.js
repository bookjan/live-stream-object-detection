const { fork } = require("child_process");

const objectDetect = fork("./utils/detection.js");
const webcamCapture = fork("./utils/webcam-capture.js");

// set stdout encoding to 'binary'
process.stdout.setDefaultEncoding("binary");

objectDetect.on("message", data => {
  process.stdout.write(data);
});

webcamCapture.on("message", data => {
  process.stdout.write(data);
});

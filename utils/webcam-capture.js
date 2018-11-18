const { cv, grabFrames } = require("./opencv-helpers");

const { opencv } = require("./config");

// set webcam interval
const camInterval = 10;

const runWebcamCapture = src =>
  grabFrames(src, camInterval, frame => {
    const frameResized = frame.resizeToMax(opencv.frameSize);

    // detect objects
    process.send(cv.imencode(".jpg", frameResized).toString("binary"));
  });

runWebcamCapture(opencv.camPort);

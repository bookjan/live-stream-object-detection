const cv = require("opencv4nodejs");

exports.cv = cv;

exports.grabFrames = (videoSource, camInterval, onFrame) => {
  const cap = new cv.VideoCapture(videoSource);
  setInterval(() => {
    let frame = cap.read();

    // loop back to start on end of stream reached
    if (frame.empty) {
      cap.reset();
      frame = cap.read();
    }

    onFrame(frame);
  }, camInterval);
};
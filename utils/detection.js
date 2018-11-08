const { cv, grabFrames, drawBlueRect } = require("./opencv-helpers");

const { opencv } = require("./config");

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

// set webcam interval
const camInterval = Math.ceil(1000 / opencv.camFps);

function detectObjects(img) {
  // restrict minSize and scaleFactor for faster processing
  const options = {
    minSize: new cv.Size(100, 100),
    scaleFactor: 1.2,
    minNeighbors: 10
  };

  /**
   * Note:
   * Method detectMultiScale is running by CPU
   * Method detectMultiScaleGpu is running by GPU
   */
  return classifier.detectMultiScaleGpu(img.bgrToGray(), options).objects;
}

const runWebcamObjectDetection = (src, detectObjects) =>
  grabFrames(src, 1, camInterval, frame => {
    const frameResized = frame.resizeToMax(opencv.frameSize);

    // detect objects
    const objectRects = detectObjects(frameResized);
    if (objectRects.length) {
      // draw detection
      objectRects.forEach(objectRect => drawBlueRect(frameResized, objectRect));
    }

    const base64String = cv.imencode(".jpg", frameResized).toString("base64");

    // write the jpg base64 data to stdout
    process.send(base64String);
  });

runWebcamObjectDetection(opencv.camPort, detectObjects);

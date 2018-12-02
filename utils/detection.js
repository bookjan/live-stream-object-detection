const path = require("path");
const fs = require("fs");

const { cv, grabFrames, drawBlueRect } = require("./opencv-helpers");
const { opencv, classNames } = require("./config");

if (!cv.xmodules.dnn) {
  throw new Error("exiting: opencv4nodejs compiled without dnn module");
}

// set stdout encoding to 'binary'
process.stdout.setDefaultEncoding("binary");

const modelPath = path.resolve(__dirname, "../model/frozen_inference_graph.pb");
const configPath = path.resolve(
  __dirname,
  "../model/ssd_mobilenet_v2_coco_2018_03_29.pbtxt"
);

if (!fs.existsSync(modelPath) || !fs.existsSync(configPath)) {
  console.log("could not find tensorflow object detection model");
  console.log(
    "download the model from: https://github.com/opencv/opencv/wiki/TensorFlow-Object-Detection-API#use-existing-config-file-for-your-model"
  );
  throw new Error("exiting: could not find tensorflow object detection model");
}

// initialize tensorflow darknet model from modelFile
const net = cv.readNetFromTensorflow(modelPath, configPath);

// set webcam interval
const camInterval = 1000 / opencv.camFps;

function objectDetect(img) {
  // object detection model works with 300 x 300 images
  const size = new cv.Size(300, 300);
  const vec3 = new cv.Vec(0, 0, 0);

  // network accepts blobs as input
  const inputBlob = cv.blobFromImage(img, 1, size, vec3, true, true);
  net.setInput(inputBlob);

  // forward pass input through entire network, will return
  // classification result as 1x1xNxM Mat
  const outputBlob = net.forward();

  // get height and width from the image
  const [imgHeight, imgWidth] = img.sizes;
  const numRows = outputBlob.sizes.slice(2, 3);

  for (let y = 0; y < numRows; y += 1) {
    const confidence = outputBlob.at([0, 0, y, 2]);
    if (confidence > 0.5) {
      const classId = outputBlob.at([0, 0, y, 1]);
      const className = classNames[classId];
      const boxX = imgWidth * outputBlob.at([0, 0, y, 3]);
      const boxY = imgHeight * outputBlob.at([0, 0, y, 4]);
      const boxWidht = imgWidth * outputBlob.at([0, 0, y, 5]);
      const boxHeight = imgHeight * outputBlob.at([0, 0, y, 6]);
      const imgRect = new cv.Rect(boxX, boxY, boxWidht, boxHeight);

      // draw the blue rect for the object
      drawBlueRect(img, imgRect);

      // put text on the object
      img.putText(
        className,
        new cv.Point(boxX, boxY + 0.1 * imgHeight),
        cv.FONT_ITALIC,
        2,
        {
          color: new cv.Vec(255, 0, 0),
          thickness: 2
        }
      );
    }
  }

  // write the jpg binary data to stdout
  process.stdout.write(cv.imencode(".jpg", img).toString("binary"));
}

const runWebcamObjectDetect = (src, objectDetect) =>
  grabFrames(src, camInterval, frame => {
    const frameResized = frame.resizeToMax(opencv.frameSize);

    // detect objects
    objectDetect(frameResized);
  });

runWebcamObjectDetect(opencv.camPort, objectDetect);

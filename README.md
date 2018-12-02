# live-stream-object-detection

Share your webcam stream with real-time object detection to the public by Node.js.

## Technologies

This project using the following technologies to go:

- [opencv4nodejs](https://github.com/justadudewhohacks/opencv4nodejs): Use it to capture webcam frames and more power
- [TensorFlow Object Detection](https://github.com/tensorflow/models/tree/master/research/object_detection): Use it to detect objects on a frame
- [FFmpeg](http://ffmpeg.org/): Use it to compress each frame and make the live streaming
- [ws](https://github.com/websockets/ws): Use it to send stream to web browser
- [JSMpeg](https://jsmpeg.com/): Use it to decode streaming from server for web browser
- [ngrok](https://ngrok.com/): Use it to get public and secure URL for exposing the local web server
- [express](https://expressjs.com/): Use it to make a web server

## Requirements

- A webcam, e.g. laptop-integrated webcam, USB webcam
- [Node.js 8 or higher](https://nodejs.org/)
- [OpenCV 3.3.1 or higher](https://opencv.org/)
- [FFmpeg 3.3 or higher](https://www.ffmpeg.org/download.html)

## Installation

The below commands to install the project.

1. `npm install`
2. `node server.js`

## Running the demo

- Make sure you are still in the `project_root` directory
- To run the server: `node server.js` then you will get the `Ngrok HTTP URL` in terminal
- To run the demo, open a browser and go to `Ngrok HTTP URL`

The app should be up and running!

/**
 * Here to set opencv configs
 */
exports.opencv = {
  // set webcam port
  camPort: 0,
  // set webcam FPS
  camFps: 25,
  // set frame size
  frameSize: 960
};

/**
 * Here to set process configs
 */
exports.process = {
  // set process count
  maxCount: 1
};

/**
 * Here to set server configs
 */
exports.server = {
  // set http port
  httpPort: 8080,
  // set websocket port
  wsPort: 8081,
  // set stream port
  streamPort: 8082,
  // set stream secret
  streamSecret: "N23y08VnzfDH4Wmf2tXoDyxbwf2rGQJC"
};

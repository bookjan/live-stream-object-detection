const { spawn } = require("child_process");
const filter = require("stream-filter");
const MultiStream = require("multistream");

const { process, server } = require("./config");

const streamArgs = [
  "-f",
  "image2pipe",
  "-framerate",
  "20",
  "-i",
  "-",
  "-movflags",
  "faststart",
  "-framerate",
  "15",
  "-vcodec",
  "mpeg1video",
  "-preset",
  "veryfast",
  "-maxrate",
  "3000k",
  "-bufsize",
  "4000k",
  "-c:a",
  "aac",
  "-b:a",
  "160k",
  "-ar",
  "44100",
  "-b:a",
  "128k",
  "-f",
  "mpegts",
  "-c:v",
  "mpeg1video",
  "-an",
  `http://localhost:${server.port}/streamIn/1`,
  "-f",
  "mpegts",
  "-c:v",
  "mpeg1video",
  "-an",
  `http://localhost:${server.port}/streamIn/2`
];

const objectDetectStreams = [];

const ffmpegStream = spawn("ffmpeg", streamArgs);
ffmpegStream.stdin.setEncoding("binary");

for (count = 1; count <= process.maxCount; count++) {
  const objectDetect = spawn("node", [`${__basedir}/utils/detection.js`]);
  objectDetect.stdout.setDefaultEncoding("binary");
  objectDetectStreams.push(objectDetect.stdout);
}

const stream = () => {
  MultiStream(objectDetectStreams)
    .pipe(
      filter(function(data) {
        // filter opencv output, example: '[ INFO:0] Initialize OpenCL runtime...'
        const regex = /\[\sINFO\:\d\]\s/gm;
        const isImgData = !regex.test(data);
        return isImgData;
      })
    )
    .pipe(ffmpegStream.stdin);

  ffmpegStream.stdout.on("data", function(data) {
    console.log("stdout: " + data.toString());
  });

  ffmpegStream.stderr.on("data", function(data) {
    console.log("stderr: " + data.toString());
  });

  ffmpegStream.on("exit", function(code) {
    console.log("child process exited with code " + code.toString());
  });
};

module.exports = stream;

const { spawn } = require("child_process");
const filter = require("stream-filter");

const { server } = require("./config");

const streamArgs = [
  "-f",
  "image2pipe",
  // "-framerate",
  // "6",
  "-i",
  "-",
  // "-r",
  // "30",
  "-f",
  "mpegts",
  "-c:v",
  "mpeg1video",
  "-q",
  "8",
  // "-filter:v",
  // "minterpolate='mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=30'",
  // "-b:v",
  // "600k",
  // "-maxrate:v",
  // "600k",
  // "-bufsize",
  // "400k",
  "-an",
  `http://localhost:${server.streamPort}/${server.streamSecret}`
];

const ffmpegStream = spawn("ffmpeg", streamArgs);
ffmpegStream.stdin.setEncoding("binary");

const combineStream = spawn("node", [`${__basedir}/utils/combine.js`]);
combineStream.stdout.setDefaultEncoding("binary");

const stream = () => {
  combineStream.stdout
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

import { writeFile } from "fs";
import moment from "moment";
import cron from "node-cron";
import { Tail } from "tail";
import zlib from "zlib";
import { log, randint, randomRequest } from "./utils.js";

const tail = new Tail("../logs/dashboards.stdout.log", { fromBeginning: true });
tail.on("error", (error) => console.error("ERROR: ", error));

const SQL_DATE_FORMAT = "YYYY-MM-DD hh:mm:ss";

let buffer = [];
let startTime = "";
let endTime = "";

const batch = () => {
  if (buffer.length === 0) return;

  const now = new Date();
  const file = `./output/dashboards--${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}.txt.gz`;
  const gz = zlib.gzipSync(buffer.join("\n"));

  writeFile(file, gz, (err) => {
    if (err) {
      log("Write to file failed");
      return;
    }
    log(
      `${file} written to disk, startTime = ${startTime}, endTime = ${endTime}`
    );
    buffer.length = 0;
    startTime = "";
    endTime = "";
  });
};

cron.schedule("* * * * *", () => {
  batch();
});

tail.on("line", function (line) {
  let message = "";
  try {
    const json = JSON.parse(line);
    message = `, status code: ${json.statusCode}`;
  } catch (error) {
    message = ", failed to parse json";
  }
  const date = moment().format(SQL_DATE_FORMAT);
  log(`Received a new line${message}`);

  if (buffer.length === 0) startTime = date;
  endTime = date;
  buffer.push(line);
});

setInterval(() => randomRequest(), randint(1500, 3000));

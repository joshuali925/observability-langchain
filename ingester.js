import { writeFile } from "fs";
import moment from "moment";
import cron from "node-cron";
import { Tail } from "tail";
import zlib from "zlib";
import { log, randint, randomRequest } from "./utils.js";

const tail = new Tail("../logs/dashboards.stdout.log", {
  fromBeginning: false,
});
tail.on("error", (error) => console.error("ERROR: ", error));

const SQL_DATE_FORMAT = "YYYY-MM-DD hh:mm:ss";

let buffer = [];
let startTime = "";
let endTime = "";
const metadata = { offset: [] };

const batch = () => {
  if (buffer.length === 0) return;

  const now = new Date();
  const file = `./output/${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-dashboards--${now.getHours()}-${now.getMinutes()}.txt.gz`;
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

cron.schedule("0 * * * *", () => {
  batch();
});

cron.schedule("*/10 * * * *", () => {
  metadata.offset.push(buffer.length);
  log(`Current offset: ${buffer.length}`);
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

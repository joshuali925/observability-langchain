import { writeFile } from "fs";
import moment from "moment";
import cron from "node-cron";
import { Tail } from "tail";
import zlib from "zlib";
import { log, putOpenSearch, putS3, randint, randomRequest } from "./utils.js";

const tail = new Tail("../logs/dashboards.stdout.log", {
  fromBeginning: false,
});
tail.on("error", (error) => console.error("ERROR: ", error));

const SQL_DATE_FORMAT = "YYYY-MM-DD hh:mm:ss";
const BUCKET = "sql-maximus-poc-test-bucket-519072602456";
const INDEX = "s3-test-js-script";

let buffer = [];
let startTime = "";
let endTime = "";
let metadata = {
  meta: {
    offset: [],
    bucket: BUCKET,
    type: "s3",
    object: "",
  },
  raw: "",
};

const batch = () => {
  if (buffer.length === 0) return;

  const now = new Date();
  const date = [
    now.getFullYear(), //                       0
    ("0" + (now.getMonth() + 1)).slice(-2), //  1
    ("0" + now.getDate()).slice(-2), //         2
    ("0" + now.getHours()).slice(-2), //        3
    ("0" + now.getMinutes()).slice(-2), //      4
  ];
  const filePath = `./output/${date.slice(0, 3).join("-")}-dashboards-${date
    .slice(3)
    .join("-")}.txt.gz`;
  const gz = zlib.gzipSync(buffer.join("\n"));

  writeFile(filePath, gz, async (err) => {
    if (err) {
      log("Write to file failed");
      return;
    }
    log(
      `${filePath} written to disk, startTime = ${startTime}, endTime = ${endTime}`
    );

    const s3Object =
      "logs/dashboards/" +
      date.slice(0, 3).join("/") +
      filePath.slice(filePath.lastIndexOf("/"));
    putS3(BUCKET, filePath, s3Object);

    metadata.meta.object = s3Object;
    metadata.startTime = startTime;
    metadata.endTime = endTime;
    await putOpenSearch(INDEX, metadata);

    metadata = {
      meta: {
        offset: [],
        bucket: BUCKET,
        type: "s3",
        object: "",
      },
      raw: "",
    };
    buffer.length = 0;
    startTime = "";
    endTime = "";
  });
};

cron.schedule("* * * * *", () => {
  batch();
});

/* cron.schedule("* * * * *", () => {
  metadata.offset.push(buffer.length);
  log(`Current offset: ${buffer.length}`);
}); */

tail.on("line", function (line) {
  let message = "";
  try {
    const json = JSON.parse(line);
    message = `, status code: ${json.statusCode}`;
  } catch (error) {
    message = ", failed to parse json";
  }
  const date = moment().toISOString();
  log(`Received a new line${message}`);

  if (buffer.length === 0) startTime = date;
  endTime = date;
  buffer.push(line);
});

setInterval(() => randomRequest(), randint(1500, 3000));

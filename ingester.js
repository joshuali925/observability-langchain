import { writeFile } from "fs";
import moment from "moment";
import cron from "node-cron";
import { Tail } from "tail";
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
  const file = `./output/dashboards--${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}.txt`;
  writeFile(file, buffer.join("\n"), (err) => {
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
  /* const json = JSON.parse(line);
  const date = moment.unix(json.ts).format(SQL_DATE_FORMAT); */
  const date = moment().format(SQL_DATE_FORMAT);
  log("Received a new line");

  if (buffer.length === 0) startTime = date;
  endTime = date;
  buffer.push(line);
});

setInterval(() => randomRequest(), randint(1500, 3000));

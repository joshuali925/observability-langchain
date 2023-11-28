// @ts-check
import { check } from "k6";
import http from "k6/http";
// k6 is based on Goja, not Node.js. fs is not supported
import longPPLParams from "../prompts/long_ppl_params.json";
import summarizeParams from "../prompts/summarize_params.json";

// Test configuration
export const options = {
  thresholds: {
    http_req_duration: ["p(95) < 10000"],
  },
  stages: [
    { duration: "3s", target: 300 },
    { duration: "10m", target: 300 },
  ],
};

const log = (...args) => console.log(`[${new Date().toISOString()}]`, ...args);

const OSD_API = "http://localhost:5601/api";

const post = (url, body) =>
  http.post(url, body, {
    auth: "basic",
    // this is the default auth, change it based on actual cluster setup
    headers: { "osd-xsrf": "skip", Authorization: "Basic YWRtaW46YWRtaW4=" },
  });

const osdGeneratePPLShort = () =>
  post(
    `${OSD_API}/assistant/generate_ppl`,
    JSON.stringify({
      question: "Are there any errors in my logs?",
      index: "opensearch_dashboards_sample_data_logs",
    }),
  );

const osdGeneratePPLLong = () =>
  post(`${OSD_API}/assistant/generate_ppl`, JSON.stringify(longPPLParams));

const osdSummarize = () =>
  post(`${OSD_API}/assistant/summarize`, JSON.stringify(summarizeParams));

// Simulated user behavior
export default function () {
  const pplRes = osdGeneratePPLShort();
  log("[PPL]", `status: ${pplRes.status}, body: ${pplRes.body}`);
  check(pplRes, {
    "status was 200": (r) => r.status == 200,
    "response is ppl": (r) => !!r.body.includes("source"),
  });

  /* const summarizeRes = osdSummarize();
  log(
    "[Summarize]",
    `status: ${summarizeRes.status}, body: ${summarizeRes.body}`,
  );
  check(summarizeRes, {
    "status was 200": (r) => r.status == 200,
    "summary mentions logs": (r) =>
      !!JSON.parse(r.body).summary.includes("logs"),
    "summary mentions errors": (r) =>
      !!JSON.parse(r.body).summary.includes("errors"),
    "has 2 or more suggestions": (r) =>
      !!(JSON.parse(r.body).suggestedQuestions.length >= 2),
  }); */
}

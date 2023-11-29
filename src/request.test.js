// @ts-check
import { check } from "k6";
import http from "k6/http";
// k6 is based on Goja, not Node.js. fs is not supported
import longPPLParams from "../prompts/long_ppl_params.json";
import summarizeParams from "../prompts/summarize_params.json";
import mlCommonsPrompts from "../prompts/ml_commons.json";

// Test configuration
export const options = {
  insecureSkipTLSVerify: true,
  thresholds: {
    http_req_duration: ["p(95) < 10000"],
  },
  stages: [
    { duration: "3s", target: 500 },
    { duration: "5m", target: 500 },
  ],
};

const log = (...args) => console.log(`[${new Date().toISOString()}]`, ...args);

const OSD_API = "http://localhost:5601/api/assistant";
const OS_API =
  "https://localhost:9200/_plugins/_ml/models/94p9F4wBQUohL7lYf6Uo/_predict";

const postOSD = (path, body) =>
  http.post(`${OSD_API}/${path}`, JSON.stringify(body), {
    auth: "basic",
    // this is the default auth, change it based on actual cluster setup
    headers: { "osd-xsrf": "skip", Authorization: "Basic YWRtaW46YWRtaW4=" },
  });

const postOS = (question) =>
  http.post(
    OS_API,
    JSON.stringify({
      parameters: {
        temperature: 0.0000001,
        max_tokens_to_sample: 2048,
        prompt: `\n\nHuman: ${question}\n\nAssistant:`,
      },
    }),
    {
      auth: "basic",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic YWRtaW46YWRtaW4=",
      },
    },
  );

const osdGeneratePPLShort = () =>
  postOSD(`generate_ppl`, {
    question: "Are there any errors in my logs?",
    index: "opensearch_dashboards_sample_data_logs",
  });
const osdGeneratePPLLong = () => postOSD("generate_ppl", longPPLParams);
const osdSummarize = () => postOSD("summarize", summarizeParams);

export default function () {
  // const pplRes = postOS(mlCommonsPrompts.ppl_short);
  const pplRes = osdGeneratePPLShort();
  log("[PPL]", `status: ${pplRes.status}, request: ${pplRes.body}, error: ${pplRes.error}`);
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

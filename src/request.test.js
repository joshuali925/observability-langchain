// @ts-check
import { check } from "k6";
import http from "k6/http";

// Test configuration
export const options = {
  thresholds: {
    http_req_duration: ["p(95) < 10000"],
  },
  stages: [
    { duration: "3s", target: 100 },
    { duration: "30m", target: 500 },
  ],
};

const log = (...args) => console.log(`[${new Date().toISOString()}]`, ...args);

const post = (url, body) =>
  http.post(url, body, {
    auth: "basic",
    // this is the default auth, change it based on actual cluster setup
    headers: { "osd-xsrf": "skip", Authorization: "Basic YWRtaW46YWRtaW4=" },
  });

// Simulated user behavior
export default function () {
  const pplRes = post(
    "http://localhost:5601/api/assistant/generate_ppl",
    JSON.stringify({
      question: "Are there any errors in my logs?",
      index: "opensearch_dashboards_sample_data_logs",
    }),
  );
  log("[PPL]", `status: ${pplRes.status}, body: ${pplRes.body}`);
  check(pplRes, {
    "status was 200": (r) => r.status == 200,
    "response is ppl": (r) => !!r.body.includes("source"),
  });

  const summarizeRes = post(
    "http://localhost:5601/api/assistant/summarize",
    JSON.stringify({
      question: "Are there any errors in my logs?",
      index: "opensearch_dashboards_sample_data_logs",
      isError: false,
      query:
        "source=opensearch_dashboards_sample_data_logs | where QUERY_STRING(['response'], '4* OR 5*')",
      response:
        '{"datarows":[["http://twitter.com/success/konstantin-feoktistov","/styles/main.css","Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24","css",null,"120.49.143.213","opensearch_dashboards_sample_data_logs","120.49.143.213 - - [2018-07-22T03:30:25.131Z] \\"GET /styles/main.css_1 HTTP/1.1\\" 503 0 \\"-\\" \\"Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24\\"","https://cdn.opensearch-opensearch-opensearch.org/styles/main.css_1","success",{"srcdest":"CO:DE","src":"CO","coordinates":{"lat":36.96015,"lon":-78.18499861},"dest":"DE"},"2023-11-12 03:30:25.131",0,{"os":"ios","ram":20401094656},"503","120.49.143.213","cdn.opensearch-opensearch-opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 03:30:25.131"],["http://www.opensearch-opensearch-opensearch.com/success/richard-o-covey","/apm","Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1","",null,"106.225.58.146","opensearch_dashboards_sample_data_logs","106.225.58.146 - - [2018-07-22T03:49:40.669Z] \\"GET /apm_1 HTTP/1.1\\" 503 0 \\"-\\" \\"Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1\\"","https://www.opensearch.org/downloads/apm_1","success",{"srcdest":"EG:CN","src":"EG","coordinates":{"lat":35.98531194,"lon":-85.80931806},"dest":"CN"},"2023-11-12 03:49:40.669",0,{"os":"win 7","ram":17179869184},"503","106.225.58.146","www.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 03:49:40.669"],["http://twitter.com/success/patrick-baudry","/opensearch_dashboards/opensearch_dashboards-1.0.0-linux-x86_64.tar.gz","Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24","gz",null,"117.165.135.88","opensearch_dashboards_sample_data_logs","117.165.135.88 - - [2018-07-22T06:22:55.923Z] \\"GET /opensearch_dashboards/opensearch_dashboards-1.0.0-linux-x86_64.tar.gz_1 HTTP/1.1\\" 404 9890 \\"-\\" \\"Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24\\"","https://artifacts.opensearch.org/downloads/opensearch_dashboards/opensearch_dashboards-1.0.0-linux-x86_64.tar.gz_1","success",{"srcdest":"CN:TW","src":"CN","coordinates":{"lat":39.58316583,"lon":-85.80481},"dest":"TW"},"2023-11-12 06:22:55.923",9890,{"os":"win 8","ram":17179869184},"404","117.165.135.88","artifacts.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 06:22:55.923"],["http://nytimes.com/success/michael-j-smith","/beats/filebeat/filebeat-6.3.2-linux-x86.tar.gz","Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)","gz",null,"7.127.73.138","opensearch_dashboards_sample_data_logs","7.127.73.138 - - [2018-07-22T06:23:10.870Z] \\"GET /beats/filebeat/filebeat-6.3.2-linux-x86.tar.gz_1 HTTP/1.1\\" 404 3039 \\"-\\" \\"Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)\\"","https://artifacts.opensearch.org/downloads/beats/filebeat/filebeat-6.3.2-linux-x86.tar.gz_1","warning",{"srcdest":"VN:BR","src":"VN","coordinates":{"lat":36.68711028,"lon":-82.03333583},"dest":"BR"},"2023-11-12 06:23:10.87",3039,{"os":"ios","ram":13958643712},"404","7.127.73.138","artifacts.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 06:23:10.87"],["http://www.opensearch-opensearch-opensearch.com/success/thomas-hennen","/beats/filebeat","Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24","",null,"65.129.211.245","opensearch_dashboards_sample_data_logs","65.129.211.245 - - [2018-07-22T12:23:35.819Z] \\"GET /beats/filebeat HTTP/1.1\\" 503 0 \\"-\\" \\"Mozilla/5.0 (X11; Linux i686) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.50 Safari/534.24\\"","https://www.opensearch.org/downloads/beats/filebeat","success",{"srcdest":"KH:CN","src":"KH","coordinates":{"lat":39.90415167,"lon":-74.74954917},"dest":"CN"},"2023-11-12 12:23:35.819",0,{"os":"win 7","ram":9663676416},"503","65.129.211.245","www.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 12:23:35.819"],["http://www.opensearch-opensearch-opensearch.com/success/martin-j-fettman","/enterprise","Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1","",null,"63.238.199.177","opensearch_dashboards_sample_data_logs","63.238.199.177 - - [2018-07-22T15:52:07.797Z] \\"GET /enterprise HTTP/1.1\\" 503 0 \\"-\\" \\"Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1\\"","https://www.opensearch.org/downloads/enterprise","success",{"srcdest":"DE:UA","src":"DE","coordinates":{"lat":35.51105833,"lon":-108.7893094},"dest":"UA"},"2023-11-12 15:52:07.797",0,{"os":"win 8","ram":32212254720},"503","63.238.199.177","www.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 15:52:07.797"],["http://www.opensearch-opensearch-opensearch.com/success/vladimir-dzhanibekov","/apm-server/apm-server-6.3.2-windows-x86.zip","Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1","zip",null,"23.181.102.75","opensearch_dashboards_sample_data_logs","23.181.102.75 - - [2018-07-22T12:01:31.928Z] \\"GET /apm-server/apm-server-6.3.2-windows-x86.zip HTTP/1.1\\" 404 9446 \\"-\\" \\"Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1\\"","https://artifacts.opensearch.org/downloads/apm-server/apm-server-6.3.2-windows-x86.zip","success",{"srcdest":"CN:IN","src":"CN","coordinates":{"lat":65.17439528,"lon":-152.1093886},"dest":"IN"},"2023-11-12 12:01:31.928",9446,{"os":"win xp","ram":3221225472},"404","23.181.102.75","artifacts.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 12:01:31.928"],["http://www.opensearch-opensearch-opensearch.com/success/wally-schirra","/opensearch_dashboards/opensearch_dashboards-1.0.0-darwin-x86_64.tar.gz","Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1","gz",null,"135.201.60.64","opensearch_dashboards_sample_data_logs","135.201.60.64 - - [2018-07-22T12:42:13.959Z] \\"GET /opensearch_dashboards/opensearch_dashboards-1.0.0-darwin-x86_64.tar.gz HTTP/1.1\\" 503 0 \\"-\\" \\"Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1\\"","https://artifacts.opensearch.org/downloads/opensearch_dashboards/opensearch_dashboards-1.0.0-darwin-x86_64.tar.gz","success",{"srcdest":"MY:IN","src":"MY","coordinates":{"lat":33.19155556,"lon":-99.71793056},"dest":"IN"},"2023-11-12 12:42:13.959",0,{"os":"ios","ram":3221225472},"503","135.201.60.64","artifacts.opensearch.org",{"dataset":"sample_web_logs"},null,"2023-11-12 12:42:13.959"],["http://facebook.com/success/eileen-collins","/","Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1","",null,"110.47.202.158","opensearch_dashboards_sample_data_logs","110.47.202.158 - - [2018-07-22T17:25:34.323Z] \\"GET / HTTP/1.1\\" 503 0 \\"-\\" \\"Mozilla/5.0 (X11; Linux x86_64; rv:6.0a1) Gecko/20110421 Firefox/6.0a1\\"","https://www.opensearch.org/downloads","success",{"srcdest":"CN:CN","src":"CN","coordinates":{"lat":42.30727806,"lon":-85.25147972},"dest":"',
    }),
  );
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
  });
}

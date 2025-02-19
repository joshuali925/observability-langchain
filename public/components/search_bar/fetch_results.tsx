

const fetchResults = (
  Query: string,
  DefaultQuery: string,
  api: string
) => {
  return fetch(api, {
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
      'kbn-version': '7.7.0',
    },
    body: `{"query":"${Query || DefaultQuery}"}`,
  })
    .then(resp => resp.json())
};

export const fetchSoon = (
  query: string,
  language: string,
  setResponse,
) => {
  if (language === 'SQL') {
    fetchResults(query, 'select * from kibana_sample_data_logs', '../api/sql_console/query')
      .then(json => JSON.parse(json.resp))
      .then(json => setResponse(json))
  } else if (language === 'PPL') {
    fetchResults(query, 'source=kibana_sample_data_logs', 'http://localhost:9200/_opendistro/_ppl')
      .then(json => setResponse(json))
  }
};
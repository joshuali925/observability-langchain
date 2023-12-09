# Assistant Testing Framework

```bash
# set environment variables, defaults:
export OPENSEARCH_URL=https://localhost:9200
export DASHBOARDS_URL=http://localhost:5601
export OPENSEARCH_USERNAME=admin
export OPENSEARCH_PASSWORD=admin

# optional variables:
# set the api provider if not specified in tests, see ./src/providers/constants/index.ts for possible options
export API_PROVIDER=olly_chat
# agent id is required if using 'agent_framework' as provider
export AGENT_ID=<agent-id>

npm i
npm run test

# run tests for a specific tool
npm run test src/tests/api/cat.test.ts
```

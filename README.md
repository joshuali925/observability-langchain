# Assistant Testing Framework

## Run test framework

### 1. Clone repo and install dependencies

```bash
git clone https://github.com/joshuali925/observability-langchain -b assistant-tests
cd assistant-tests
npm i
```

### 2. Set up environment variables

You can set environment variables in a `.env` file, or export them before running the test, or do something like `VAR=VAL npm run test`. Here are a list of variables used:

- `OPENSEARCH_URL`: the opensearch endpoint. defaults to `https://localhost:9200`
- `DASHBOARDS_URL`: the dashboards endpoint. defaults to `http://localhost:5601`
- `OPENSEARCH_USERNAME`: username of the user, make sure the user has permission to make ml-commons requests. defaults to `admin`
- `OPENSEARCH_PASSWORD`: password of the user. defaults to `admin`
- `API_PROVIDER`: which API provider to use for testing. defaults to `olly_chat`. options: `olly_chat` or `agent_framework`
- Agent ID variables: required if `API_PROVIDER=agent_framework`
    - `AGENT_ID`: the agent_id for the root agent in chat related tests
    - `PPL_AGENT_ID`: the agent_id that uses the PPLTool for PPL related tests
- ML-Commons model IDs: required if LLM or embeddings based test evaluations are used. fallbacks to reading `.chat-assistant-config` if not provided
    - `ML_COMMONS_LLM_ID`: ml-commons model id for LLM based requests
    - `ML_COMMONS_EMBEDDINGS_MODEL_ID`: ml-commons model id for embeddings based requests

### 3. Run tests
```bash
# run all tests
npm run test

# run tests for a specific tool
npm run test -- src/tests/api/cat.test.ts

# run tests with sequential execution (default concurrency is 5)
npm run test -- src/tests/api/cat.test.ts --maxConcurrency=1
```

### 4. See results

Results are stored in the [results](./results) directory.

# Adding Alerting Test Cases
If you're adding test cases to test the Alerting tool, please add your test cases to `src/tests/templates/get_alerts_test_templates.jsonl`. The test questions follow a template for questions or answers that concern specific dates (e.g. "How many alerts triggered on December 6?"). Any questions or answers that don't involve specific dates can be added as is, but for those that do involve specific dates, please follow the following syntax:

<{alert-id}.{start_time|end_time|acknowledged_time|last_notification_time},{date|dateAndTime}>

alert-id: the alert whose event time you would like to use in your test question/answer

start_time|end_time|acknowledged_time|last_notification_time: choose from this set the alert event time you would like to use. Note that the alert you use must have a valid value for the alert event time chosen here (e.g. if you choose "end_time" for an alert that is not COMPLETED in the alert cluster context, the framework will throw an error)

date|dateAndTime: choose from this set the format of the time you would like to use in your question/answer. Choosing "date" gives the month and day of the event (e.g. Dec 06), while choosing "dateAndTime" gives the month, day and time of the event (e.g. Dec 06 13:40). Adding the day of the week is currently not supported.

example: <0OgfsOs5t6yqi81f3yj18.start_time,dateAndTime>

for more examples, consult `src/tests/templates/get_alerts_test_templates.jsonl`

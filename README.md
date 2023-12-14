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
# run all tests
npm run test

# run tests for a specific tool
npm run test src/tests/api/cat.test.ts

# run tests with sequential execution (default concurrency is 5)
npm run test src/tests/api/cat.test.ts --maxConcurrency=1
```

# Adding Alerting Test Cases
If you're adding test cases to test the Alerting tool, please add your test cases to `src/tests/templates/get_alerts_test_templates.jsonl`. The test questions follow a template for questions or answers that concern specific dates (e.g. "How many alerts triggered on December 6?"). Any questions or answers that don't involve specific dates can be added as is, but for those that do involve specific dates, please follow the following syntax:

<{alert-id}.{start_time|end_time|acknowledged_time|last_notification_time},{date|dateAndTime}>

alert-id: the alert whose event time you would like to use in your test question/answer

start_time|end_time|acknowledged_time|last_notification_time: choose from this set the alert event time you would like to use. Note that the alert you use must have a valid value for the alert event time chosen here (e.g. if you choose "end_time" for an alert that is not COMPLETED in the alert cluster context, the framework will throw an error)

date|dateAndTime: choose from this set the format of the time you would like to use in your question/answer. Choosing "date" gives the month and day of the event (e.g. Dec 06), while choosing "dateAndTime" gives the month, day and time of the event (e.g. Dec 06 13:40). Adding the day of the week is currently not supported.

example: <0OgfsOs5t6yqi81f3yj18.start_time,dateAndTime>

for more examples, consult `src/tests/templates/get_alerts_test_templates.jsonl`

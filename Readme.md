# Load tests with ml-commons and olly

### Run load test

first install [k6](https://k6.io/), then run

```bash
git clone git@github.com:joshuali925/observability-langchain -b load-tests load-tests
cd load-tests
npm install
npm run start [-- --vus <number-of-starting-users>]
```

### Change config

modify `request.test.js`, see k6 docs: https://k6.io/docs/using-k6/k6-options/reference/

# ExpTech API Wrapper

## Installation

```bash
npm install @kamiya4047/exptech-api-wrapper
```

## Usage

API documentation can be found [here](https://data.exptech.com.tw/).

```js
const { ExpTechApi } = require("@kamiya4047/exptech-api-wrapper");
const api = new ExpTechApi(/* YOUR API KEY HERE */);
```

### Example

getReports

```js
(async () => {
    console.log(await api.getReports(10));
})();
```
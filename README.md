>ℹ️&nbsp;&nbsp;SignalFx was acquired by Splunk in October 2019. See [Splunk SignalFx](https://www.splunk.com/en_us/investor-relations/acquisitions/signalfx.html) for more information.

> # :warning: Deprecation Notice
> **The SignalFx NodeJs Azure Function Wrapper is deprecated and will reach End of Support on Jan 20, 2024. After that date, this repository will be archived and no longer receive updates. Until then, only critical security fixes and bug fixes will be provided.**

# SignalFx Node Azure Function Wrapper

SignalFx Node Azure Function Wrapper.

## Usage


The SignalFx NodeJS Azure Function Wrapper is a wrapper around an Azure Function NodeJS function handler, used to instrument execution of the function and send metrics to SignalFx.

### Installation

Use the hosted package:
```
{
  "name": "my-module",
  "dependencies": {
    "signalfx-azure-functions": "^0.0.10"
  }
}
```

Wrap your function handler

```
'use strict';

const signalFxAzureFunction = require('signalfx-azure-functions');

module.exports = signalFxAzureFunction.wrapper((context, some_binding_obj, callback) => {
  context.res = myFunc(context, some_binding_obj);
  callback();
});
```

- By default, only 1 binding trigger object is passed through the wrapper. If you have multiple, you may need to modify your function to access them through the context object (e.g. `context.bindings.myInput`).
- The function wrapper will call `context.done()` in the callback itself.

#### Configuring the ingest endpoint

By default, this function wrapper will send to the `us0` realm. If you are
not in this realm you will need to set the `SIGNALFX_INGEST_ENDPOINT` environment
variable to the correct realm ingest endpoint (https://ingest.{REALM}.signalfx.com).
To determine what realm you are in, check your profile page in the SignalFx
web application (click the avatar in the upper right and click My Profile).



### Environment Variables

```
 SIGNALFX_AUTH_TOKEN=signalfx token
```

Optional parameters available:
```
SIGNALFX_SEND_TIMEOUT=milliseconds for signalfx client timeout [1000]

# Change the ingest endpoint URL:
SIGNALFX_INGEST_ENDPOINT=[https://ingest.us0.signalfx.com]
```

### Metrics and dimensions sent by the wrapper

The function wrapper sends the following metrics to SignalFx:

| Metric Name  | Type | Description |
| ------------- | ------------- | ---|
| azure.function.invocations  | Counter  | Count number of function invocations|
| azure.function.errors  | Counter  | Count number of errors from underlying function handler|
| azure.function.duration  | Gauge  | Milliseconds in execution time of underlying function handler|

The function wrapper adds the following dimensions to all data points sent to SignalFx:

| Dimension | Description |
| ------------- | ---|
| azure_region  | Azure region where the function is executed  |
| azure_function_name  | Name of the function |
| azure_resource_name  | Name of the function app where the function is running |
| function_wrapper_version  | SignalFx function wrapper qualifier (e.g. signalfx-azurefunction-0.0.11) |
| is_Azure_Function  | Used to differentiate between Azure App Service and Azure Function metrics |
| metric_source | The literal value of 'azure_function_wrapper' |

### Sending a metric from the Azure function

```
'use strict';

const signalFxAzureFunction = require('signalfx-azure-functions');

module.exports = signalFxAzureFunction.wrapper((context, some_binding_obj, callback) => {
  ....
  signalFxAzureFunction.helper.sendGauge('gauge.name', value);
  callback();
});
```

### Deployment

Run `npm pack` to package the module with the configuration in `package.json`.

### Testing locally

1) Set up the local Azure Function runtime: https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-local

2) Add the environment variables described above to your `local.settings.json`

3) Wrap function as stated above, run the runtime.

### License

Apache Software License v2. Copyright © 2014-2017 SignalFx

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

const signalFxAzureFunctions = require('signalfx-azure-functions');

module.exports = signalFxAzure.wrapper((context, some_binding_obj, callback) => {
  context.res = myFunc(context);
  callback();
});
```

- By default, only 1 binding trigger object is passed through the wrapper. If you have multiple, you may need to modify your function to access them through the context object (e.g. `context.bindings.myInput`).
- The function wrapper will call `context.done()` in the callback itself.



### Environment Variables

```
 SIGNALFX_AUTH_TOKEN=signalfx token
```

Optional parameters available:
```
SIGNALFX_SEND_TIMEOUT=milliseconds for signalfx client timeout [1000]

# Change the ingest endpoint URL:
SIGNALFX_INGEST_ENDPOINT=[https://pops.signalfx.com]
```

### Metrics and dimensions sent by the wrapper

The Lambda wrapper sends the following metrics to SignalFx:

| Metric Name  | Type | Description |
| ------------- | ------------- | ---|
| azure.function.invocations  | Counter  | Count number of function invocations|
| azure.function.errors  | Counter  | Count number of errors from underlying function handler|
| azure.function.duration  | Gauge  | Milliseconds in execution time of underlying function handler|

The Lambda wrapper adds the following dimensions to all data points sent to SignalFx:

| Dimension | Description |
| ------------- | ---|
| azure_region  | Azure region where the function is executed  |
| azure_function_name  | Name of the function |
| azure_resource_name  | Name of the function app where the function is running |
| function_wrapper_version  | SignalFx function wrapper qualifier (e.g. signalfx-azurefunction-0.0.11) |
| is_Azure_Function  | Used to differentiate between Azure App Service and Azure Function metrics |
| metric_source | The literal value of 'azure_function_wrapper' |

### Sending a metric from the Lambda function

```
'use strict';

const signalFxAzureFunctions = require('signalfx-azure-functions');

module.exports = signalFxAzure.wrapper((context, some_binding_obj, callback) => {
  ....
  signalFxLambda.helper.sendGauge('gauge.name', value);
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

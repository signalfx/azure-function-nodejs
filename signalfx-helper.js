'use strict';

const signalfx = require('signalfx');

const packageFile = require('./package.json')

const AUTH_TOKEN = process.env.SIGNALFX_AUTH_TOKEN;
const TIMEOUT_MS = process.env.SIGNALFX_SEND_TIMEOUT;
const INGEST_ENDPOINT = process.env.SIGNALFX_INGEST_ENDPOINT;

const METRIC_SOURCE = 'azure_function_wrapper';

const regions = {
  "East US 2": "eastus2",
	"West US 2": "westus2",
	"South Central US": "southcentralus",
	"West Central US": "westcentralus",
	"East US": "eastus",
	"North Central US": "northcentralus",
	"North Europe": "northeurope",
	"Canada East": "canadaeast",
	"Central US": "centralus",
	"West US": "westus",
	"West Europe": "westeurope",
	"Central India": "centralindia",
	"Southeast Asia": "southeastasia",
	"Canada Central": "canadacentral",
	"Korea Central": "koreacentral",
	"France Central": "francecentral",
	"South India": "southindia",
	"Australia East": "australiaeast",
	"Australia Southeast": "australiasoutheast",
	"Japan West": "japanwest",
	"UK West": "ukwest",
	"UK South": "uksouth",
	"Japan East": "japaneast",
	"East Asia": "eastasia",
	"Brazil South": "brazilsouth"
}
	
var CLIENT_OPTIONS = {};
if (INGEST_ENDPOINT) {
  CLIENT_OPTIONS.ingestEndpoint = INGEST_ENDPOINT
} else {
  CLIENT_OPTIONS.ingestEndpoint = 'https://ingest.us0.signalfx.com'
}

const timeoutMs = Number(TIMEOUT_MS);
if (!isNaN(timeoutMs)) {
  CLIENT_OPTIONS.timeout = timeoutMs;
} else {
  CLIENT_OPTIONS.timeout = 300;
}

var defaultDimensions, metricSender;

var sendPromises = [];

function sendMetric(metricName, metricType, metricValue, dimensions={}) {
  var dp = {
    metric: metricName,
    value: metricValue,
    dimensions: Object.assign({}, dimensions, defaultDimensions)
  };
  var datapoints = {};
  datapoints[metricType] = [dp];

  var sendPromise = metricSender.send(datapoints).catch((err) => {
    if (err) {
      console.log(err);
    }
  });
  sendPromises.push(sendPromise);
  return sendPromise;
}

const clearSendPromises = () => {
  sendPromises = [];
}

function setAccessToken(accessToken) {
  metricSender = new signalfx.IngestJson(accessToken || AUTH_TOKEN, CLIENT_OPTIONS);
} 

module.exports = {
  setAccessToken: setAccessToken,
  setAzureFunctionContext: function setAzureFunctionContext(context, dimensions) {
    defaultDimensions = Object.assign({}, dimensions);
    defaultDimensions.azure_function_name = context.executionContext.functionName;
    defaultDimensions.azure_resource_name = process.env.WEBSITE_SITE_NAME || process.env.APP_POOL_ID;
    defaultDimensions.azure_region = regions[process.env.REGION_NAME] || "undefined";
    defaultDimensions.function_wrapper_version = packageFile.name + '-' + packageFile.version;
    defaultDimensions.is_Azure_Function = 'true';
    defaultDimensions.metric_source = METRIC_SOURCE;
  },
  sendGauge: function addGauge(metricName, metricValue, dimensions) {
    return sendMetric(metricName, 'gauges', metricValue, dimensions);
  },

  sendCounter: function addCounter(metricName, metricValue, dimensions) {
    return sendMetric(metricName, 'counters', metricValue, dimensions);
  },

  waitForAllSends: function waitForAllSends() {
    return Promise.all(sendPromises).then(clearSendPromises, clearSendPromises);
  }
}

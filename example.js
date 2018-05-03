'use strict';

const signalFxAzure = require('signalfx-azure-functions')

module.exports = signalFxAzure.wrapper((context, callback) => {
  context.res = myFunc(context);
  callback();
});


function myFunc(context, callback) {
  if (context.req.query.name || (context.req.body && context.req.body.name)) {
    context.res = {
      body: "Hello " + (context.req.query.name || context.req.body.name)
    };
  }
  else {
    context.res = {
      status: 400,
      body: "Please pass a name on the query string or in the request body"
    };
  }
  return context.res;
}


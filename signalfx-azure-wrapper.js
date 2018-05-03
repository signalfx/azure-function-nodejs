'use strict';

const sfxHelper = require('./signalfx-helper');

class SignalFxWrapper {
  constructor(
    originalObj,
    originalFn,
    originalContext,
    originalBindingObj,
    originalCallback,
    dimensions,
    accessToken
  ) {
    this.originalObj = originalObj;
    this.originalFn = originalFn;
    this.originalContext = originalContext;
    this.originalBindingObj = originalBindingObj;
    this.originalCallback = originalCallback;
    sfxHelper.setAccessToken(accessToken);

    sfxHelper.setAzureFunctionContext(this.originalContext, dimensions);

    sfxHelper.sendCounter('azure.function.invocations', 1);
    return this;
  }

  invoke() {
    var exception, error, message, callbackProcessed;

    const startTime = new Date().getTime();

    const processCallback = () => {
      if (callbackProcessed) {
        return;
      }
      callbackProcessed = true;
      var duration = new Date().getTime() - startTime;
      sfxHelper.sendGauge('azure.function.duration', duration);
      
      const runCallback = () => {
        this.originalContext.done();
      }
      sfxHelper.waitForAllSends().then(runCallback, runCallback);
    }

    const customCallback = (err, msg) => {
      error = err;
      message = msg;
      processCallback();
    }

    try {
      this.originalFn.call(
        this.originalObj,
        this.originalContext,
        this.originalBindingObj,
        customCallback
      );
    } catch (err) {
      this.originalContext.log.error(err);
      sfxHelper.sendCounter('azure.function.errors', 1);
      exception = err;
      processCallback();
    }
  }
}

module.exports = (originalFn, dimensions, accessToken) => {
  return function customHandler(
    originalContext,
    originalBindingObj,
    originalCallback
  ) {
    var originalObj = this;
    return new SignalFxWrapper(
      originalObj,
      originalFn,
      originalContext,
      originalBindingObj,
      originalCallback,
      dimensions,
      accessToken
    ).invoke();
  };
};

'use strict';

const sfxHelper = require('./signalfx-helper');
const sfxWrapper = require('./signalfx-azure-wrapper');

module.exports = {
  wrapper: sfxWrapper,
  helper: sfxHelper
};

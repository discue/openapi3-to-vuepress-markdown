'use strict';

const openapi3 = require('./openapi3.js');

function convert(api, options) {
    options.samplerErrors = new Map();
    return openapi3.convert(api, options);
}

module.exports = {
    convert: convert
};

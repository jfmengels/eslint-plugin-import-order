'use strict';

var cond = require('lodash.cond');
var builtinModules = require('builtin-modules');

function constant(value) {
  return function returnValue() {
    return value;
  };
}

function isBuiltIn(name) {
  return builtinModules.indexOf(name) !== -1;
}

function isExternalModule(name) {
  return name[0] !== '.';
}

function isRelativeToParent(name) {
  return name.indexOf('../') === 0;
}

function isIndex(name) {
  return name === '.' ||
    name === './' ||
    name === './index' ||
    name === './index.js';
}

function isRelativeToSibling(name) {
  return name.indexOf('./') === 0;
}

var importType = cond([
  [isBuiltIn, constant('builtin')],
  [isExternalModule, constant('external')],
  [isRelativeToParent, constant('parent')],
  [isIndex, constant('index')],
  [isRelativeToSibling, constant('sibling')]
]);

module.exports = {
  importType: importType
};

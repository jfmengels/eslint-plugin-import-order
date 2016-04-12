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

var externalModuleRegExp = /^\w/;
function isExternalModule(name) {
  return externalModuleRegExp.test(name);
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
  [isRelativeToSibling, constant('sibling')],
  [constant(true), constant('unknown')]
]);

function isStaticRequire(node) {
  return node &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal';
}

module.exports = {
  importType: importType,
  isStaticRequire: isStaticRequire
};

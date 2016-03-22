'use strict';

var find = require('lodash.find');
var utils = require('../utils');

var defaultOrder = ['builtin', 'external', 'parent', 'index', 'sibling'];

function isStaticRequire(node) {
  return node &&
    node.type === 'CallExpression' &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal';
}

function computeRank(order, name) {
  return order.indexOf(utils.importType(name));
}

function reportIfPresentAfterLowerRank(context, node, name, rank, imported) {
  var found = find(imported, function hasHigherRank(importedItem) {
    return importedItem.rank > rank;
  });
  if (found) {
    context.report(node, name + ' import should occur before import of ' + found.name);
  }
}

function treatNode(context, node, name, order, imported) {
  var rank = computeRank(order, name);
  reportIfPresentAfterLowerRank(context, node, name, rank, imported);
  imported.push({name: name, rank: rank});
}

// Ignore dynamic requires
// Ignore not top-level requires
// Handle options

/* eslint quote-props: [2, "as-needed"] */
module.exports = function importOrderRule(context) {
  var imported = [];
  var order = context.options[0] || defaultOrder;

  return {
    ImportDeclaration: function handleImports(node) {
      var name = node.source.value;
      treatNode(context, node, name, order, imported);
    },
    VariableDeclarator: function handleRequires(node) {
      if (!isStaticRequire(node.init)) {
        return;
      }
      var name = node.init.arguments[0].value;
      treatNode(context, node, name, order, imported);
    },
    'Program.exit': function reset() {
      imported = [];
    }
  };
};

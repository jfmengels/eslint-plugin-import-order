'use strict';

var find = require('lodash.find');
var utils = require('../utils');

var defaultOrder = ['builtin', 'external', 'parent', 'sibling', 'index'];

// REPORTING

function reverse(array) {
  return array.map(function (v) {
    return {
      name: v.name,
      rank: -v.rank,
      node: v.node
    };
  }).reverse();
}

function findOutOfOrder(imported) {
  if (imported.length === 0) {
    return [];
  }
  var maxSeenRankNode = imported[0];
  return imported.filter(function (importedModule) {
    var res = importedModule.rank < maxSeenRankNode.rank;
    if (maxSeenRankNode.rank < importedModule.rank) {
      maxSeenRankNode = importedModule;
    }
    return res;
  });
}

function report(context, imported, outOfOrder, order) {
  outOfOrder.forEach(function (imp) {
    var found = find(imported, function hasHigherRank(importedItem) {
      return importedItem.rank > imp.rank;
    });
    context.report(imp.node, '`' + imp.name + '` import should occur ' + order + ' import of `' + found.name + '`');
  });
}

function makeReport(context, imported) {
  var outOfOrder = findOutOfOrder(imported);
  if (!outOfOrder.length) {
    return;
  }
  // There are things to report. Try to minimize the number of reported errors.
  var reversedImported = reverse(imported);
  var reversedOrder = findOutOfOrder(reversedImported);
  if (reversedOrder.length < outOfOrder.length) {
    report(context, reversedImported, reversedOrder, 'after');
    return;
  }
  report(context, imported, outOfOrder, 'before');
}

// DETECTING

function isStaticRequire(node) {
  return node &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal';
}

function computeRank(order, name) {
  return order.indexOf(utils.importType(name));
}

function registerNode(node, name, order, imported) {
  var rank = computeRank(order, name);
  if (rank !== -1) {
    imported.push({name: name, rank: rank, node: node});
  }
}

function isInVariableDeclarator(node) {
  return node &&
    (node.type === 'VariableDeclarator' || isInVariableDeclarator(node.parent));
}

/* eslint quote-props: [2, "as-needed"] */
module.exports = function importOrderRule(context) {
  var imported = [];
  var options = context.options[0] || {};
  var order = options.order || defaultOrder;
  var level = 0;

  function incrementLevel() {
    level++;
  }
  function decrementLevel() {
    level--;
  }

  return {
    ImportDeclaration: function handleImports(node) {
      if (node.specifiers.length) { // Ignoring unassigned imports
        var name = node.source.value;
        registerNode(node, name, order, imported);
      }
    },
    CallExpression: function handleRequires(node) {
      if (level !== 0 || !isStaticRequire(node) || !isInVariableDeclarator(node.parent)) {
        return;
      }
      var name = node.arguments[0].value;
      registerNode(node, name, order, imported);
    },
    'Program:exit': function reportAndReset() {
      makeReport(context, imported);
      imported = [];
    },
    FunctionDeclaration: incrementLevel,
    FunctionExpression: incrementLevel,
    ArrowFunctionExpression: incrementLevel,
    BlockStatement: incrementLevel,
    'FunctionDeclaration:exit': decrementLevel,
    'FunctionExpression:exit': decrementLevel,
    'ArrowFunctionExpression:exit': decrementLevel,
    'BlockStatement:exit': decrementLevel
  };
};

module.exports.schema = [
  {
    type: 'object',
    properties: {
      order: {
        type: 'array',
        uniqueItems: true,
        length: 5,
        items: {
          enum: defaultOrder
        }
      }
    },
    additionalProperties: false
  }
];

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
    var message = '`' + imp.name + '` import should occur ' + order + ' import of `' + found.name + '`';
    context.report(imp.node, message);
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

// Flatten the array-of-array buckets structure.
function rankBuckets(buckets, options) {
  if (options.alphabetize) {
    buckets.forEach(function (bucket) {
      bucket.sort(function (a, b) {
        return a.name < b.name ? -1 : 1;
      });
    });
  }

  // Flatten bucket and append to final order list.
  buckets.reduce(function (acc, bucket) {
    if (bucket && bucket.length) {
      var len = acc.length;

      bucket.forEach(function (data, i) {
        // Annotate rank.
        data.rank = len + i;
      });

      // Append imports.
      acc = acc.concat(bucket);
    }

    return acc;
  }, []);
}

// DETECTING

function isStaticRequire(node) {
  return node &&
    node.callee.type === 'Identifier' &&
    node.callee.name === 'require' &&
    node.arguments.length === 1 &&
    node.arguments[0].type === 'Literal';
}

function computeBucket(order, name) {
  var regExp = find(order, function (o) {
    return o.test && o.test(name);
  });

  // Buckets numbers are cardinal.
  return order.indexOf(regExp || utils.importType(name));
}

function registerNode(node, name, order, imported, buckets) {
  // Each node will fall into a single bucket, and may optionally be sorted
  // within that bucket.
  var bucket = computeBucket(order, name);

  if (~bucket) {
    var data = {name: name, node: node};
    buckets[bucket] = buckets[bucket] || [];
    buckets[bucket].push(data);
    imported.push(data);
  }
}

function isInVariableDeclarator(node) {
  return node &&
    (node.type === 'VariableDeclarator' || isInVariableDeclarator(node.parent));
}

function getOrder(options) {
    // Clone any explicitly-provided order tiers.
  var order = options.order ? options.order.slice() : [];

  // Loop through the default tiers, checking to see if they already exist
  // within the explicitly-provided tiers.
  for (var i = 0, len = defaultOrder.length; i < len; i++) {
    var name = defaultOrder[i];
    var index = order.indexOf(name);

    // If the tier is not already present, append it to the list.
    if (!~index) {
      order.push(name);
    }
  }

  return order;
}

/* eslint quote-props: [2, "as-needed"] */
module.exports = function importOrderRule(context) {
  var options = context.options[0] || {};

  // buckets are numbered, order is important.
  var buckets = [];
  // List of all recognized imports, in order of actual occurrence.
  var imported = [];

  var order = getOrder(options);

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
        registerNode(node, name, order, imported, buckets);
      }
    },
    CallExpression: function handleRequires(node) {
      if (level !== 0 || !isStaticRequire(node) || !isInVariableDeclarator(node.parent)) {
        return;
      }
      var name = node.arguments[0].value;
      registerNode(node, name, order, imported, buckets);
    },
    'Program:exit': function reportAndReset() {
      rankBuckets(buckets, options);
      makeReport(context, imported);
      buckets = [];
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
        type: 'array'
      },
      alphabetize: {
        type: 'boolean'
      }
    },
    additionalProperties: false
  }
];

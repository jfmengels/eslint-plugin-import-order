var fs = require('fs');
var pkgUp = require('pkg-up');
var utils = require('../utils');

function getDependencies() {
  var filepath = pkgUp.sync();
  if (!filepath) {
    return null;
  }

  try {
    var packageContent = JSON.parse(fs.readFileSync(filepath, 'utf8'));
    return {
      dependencies: packageContent.dependencies || {},
      devDependencies: packageContent.devDependencies || {}
    };
  } catch (e) {
    return null;
  }
}

function missingErrorMessage(packageName) {
  return '`' + packageName + '` is not listed in the project\'s dependencies. ' +
    'Run `npm i -S ' + packageName + '` to add it';
}

function devDepErrorMessage(packageName) {
  return '`' + packageName + '` should be listed in your project\'s dependencies, not devDependencies.';
}

function reportIfMissing(context, deps, allowDevDeps, node, name) {
  if (utils.importType(name) !== 'external') {
    return;
  }
  var packageName = name.split('/')[0];

  if (deps.dependencies[packageName] === undefined) {
    if (!allowDevDeps) {
      context.report(node, devDepErrorMessage(packageName));
    } else if (deps.devDependencies[packageName] === undefined) {
      context.report(node, missingErrorMessage(packageName));
    }
  }
}

module.exports = function (context) {
  var options = context.options[0] || {};
  var allowDevDeps = options.devDependencies !== false;
  var deps = getDependencies();

  if (!deps) {
    return {};
  }

  return {
    ImportDeclaration: function (node) {
      reportIfMissing(context, deps, allowDevDeps, node, node.source.value);
    },
    CallExpression: function handleRequires(node) {
      if (utils.isStaticRequire(node)) {
        reportIfMissing(context, deps, allowDevDeps, node, node.arguments[0].value);
      }
    }
  };
};

module.exports.schema = [
  {
    type: 'object',
    properties: {
      devDependencies: {type: 'boolean'}
    },
    additionalProperties: false
  }
];

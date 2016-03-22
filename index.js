'use strict';

module.exports = {
  rules: {
    'import-order': require('./rules/import-order')
  },
  configs: {
    recommended: {
      env: {
        es6: true
      },
      parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
      },
      rules: {
        'import-order/import-order': 2
      }
    }
  }
};

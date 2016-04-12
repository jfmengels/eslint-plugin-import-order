'use strict';

module.exports = {
  rules: {
    'import-order': require('./rules/import-order'),
    'no-extraneous-dependencies': require('./rules/no-extraneous-dependencies')
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
        'import-order/import-order': 'error',
        'import-order/no-extraneous-dependencies': 'error'
      }
    }
  }
};

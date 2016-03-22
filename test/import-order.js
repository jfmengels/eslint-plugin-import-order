import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/import-order';

const ruleTester = new RuleTester({
  env: {
    es6: true
  },
  parserOptions: {
    sourceType: 'module'
  }
});

const ruleError = {ruleId: 'import-order'};

test(() => {
  ruleTester.run('import-order', rule, {
    valid: [
      `
      var fs = require('fs');
      var async = require('async');
      var relParent1 = require('../foo');
      var relParent2 = require('../foo/bar');
      var relParent3 = require('../');
      var index = require('./');
      var sibling = require('./foo');
      `,
      `
      import fs from 'fs';
      import async, {foo1} from 'async';
      import relParent1 from '../foo';
      import relParent2, {foo2} from '../foo/bar';
      import relParent3 from '../';
      import index, {foo3} from './';
      import sibling from './foo';
      `,
      `
      var fs = require('fs');
      import async, {foo1} from 'async';
      var relParent1 = require('../foo');
      import relParent2, {foo2} from '../foo/bar';
      var relParent3 = require('../');
      import index, {foo3} from './';
      var sibling = require('./foo');
      `
    ],
    invalid: [
      {
        name: 'builtin before external module (require)',
        code: `
        var async = require('async');
        var fs = require('fs');
        `,
        errors: [
          {...ruleError, message: 'fs import should occur before import of async'}
        ]
      },
      {
        name: 'builtin before external module (import)',
        code: `
        import async from 'async';
        import fs from 'fs';
        `,
        errors: [
          {...ruleError, message: 'fs import should occur before import of async'}
        ]
      },
      {
        name: 'builtin before external module (mixed)',
        code: `
        var async = require('async');
        import fs from 'fs';
        `,
        errors: [
          {...ruleError, message: 'fs import should occur before import of async'}
        ]
      }
    ]
  });
});

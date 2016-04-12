import test from 'ava';
import {RuleTester} from 'eslint';
import rule from '../rules/no-extraneous-dependencies';

const ruleTester = new RuleTester({
  env: {
    es6: true
  },
  parserOptions: {
    sourceType: 'module'
  }
});

test(() => {
  ruleTester.run('no-extraneous-dependencies', rule, {
    valid: [
      `import 'lodash.find'`,
      `import 'pkg-up'`,
      `import foo, { bar } from 'lodash.find'`,
      `import foo, { bar } from 'pkg-up'`,
      `import 'eslint'`,
      `import 'eslint/lib/api'`,

      `require('lodash.find')`,
      `require('pkg-up')`,
      `var foo = require('lodash.find')`,
      `var foo = require('pkg-up')`,
      `import 'fs'`,
      `import './foo'`
    ],
    invalid: [
      {
        code: `import 'not-a-dependency'`,
        errors: [{
          ruleId: 'no-extraneous-dependencies',
          message: '`not-a-dependency` is not listed in the project\'s dependencies. Run `npm i -S not-a-dependency` to add it'
        }]
      },
      {
        code: `import 'eslint'`,
        options: [{devDependencies: false}],
        errors: [{
          ruleId: 'no-extraneous-dependencies',
          message: '`eslint` should be listed in your project\'s dependencies, not devDependencies.'
        }]
      },
      {
        code: `var foo = require('not-a-dependency');`,
        errors: [{
          ruleId: 'no-extraneous-dependencies',
          message: '`not-a-dependency` is not listed in the project\'s dependencies. Run `npm i -S not-a-dependency` to add it'
        }]
      },
      {
        code: `var eslint = require('eslint');`,
        options: [{devDependencies: false}],
        errors: [{
          ruleId: 'no-extraneous-dependencies',
          message: '`eslint` should be listed in your project\'s dependencies, not devDependencies.'
        }]
      }
    ]
  });
});

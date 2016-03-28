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
      // Default order using require
      `
      var fs = require('fs');
      var async = require('async');
      var relParent1 = require('../foo');
      var relParent2 = require('../foo/bar');
      var relParent3 = require('../');
      var sibling = require('./foo');
      var index = require('./');
      `,
      // Default order using import
      `
      import fs from 'fs';
      import async, {foo1} from 'async';
      import relParent1 from '../foo';
      import relParent2, {foo2} from '../foo/bar';
      import relParent3 from '../';
      import sibling, {foo3} from './foo';
      import index from './';
      `,
      // Default order using both require and import
      `
      var fs = require('fs');
      import async, {foo1} from 'async';
      var relParent1 = require('../foo');
      import relParent2, {foo2} from '../foo/bar';
      var relParent3 = require('../');
      import sibling, {foo3} from './foo';
      var index = require('./');
      `,
      // Multiple module of the same rank next to each other
      `
      var fs = require('fs');
      var fs = require('fs');
      var path = require('path');
      var _ = require('lodash');
      var async = require('async');
      `,
      // Overriding order to be the reverse of the default order
      {
        code: `
          var index = require('./');
          var sibling = require('./foo');
          var relParent3 = require('../');
          var relParent2 = require('../foo/bar');
          var relParent1 = require('../foo');
          var async = require('async');
          var fs = require('fs');
        `,
        options: [{order: ['index', 'sibling', 'parent', 'external', 'builtin']}]
      },
      // Ignore dynamic requires
      `
      var path = require('path');
      var _ = require('lodash');
      var async = require('async');
      var fs = require('f' + 's');
      `,
      // Ignore non-require call expressions
      `
      var path = require('path');
      var result = add(1, 2);
      var _ = require('lodash');
      `,
      // Ignore requires that are not at the top-level
      `
      var index = require('./');
      function foo() {
        var fs = require('fs');
      }
      () => require('fs');
      if (a) {
        require('fs');
      }
      `,
      // Ignore unknown/invalid cases
      `
      var unknown1 = require('/unknown1');
      var fs = require('fs');
      var unknown2 = require('/unknown2');
      var async = require('async');
      var unknown3 = require('/unknown3');
      var foo = require('../foo');
      var unknown4 = require('/unknown4');
      var bar = require('../foo/bar');
      var unknown5 = require('/unknown5');
      var parent = require('../');
      var unknown6 = require('/unknown6');
      var foo = require('./foo');
      var unknown7 = require('/unknown7');
      var index = require('./');
      var unknown8 = require('/unknown8');
      `,
      // Ignoring unassigned values by default (require)
      `
      require('./foo');
      require('fs');
      var path = require('path');
      `,
      // Ignoring unassigned values by default (import)
      `
      import './foo';
      import 'fs';
      import path from 'path';
      `,
      // No imports
      `
      function add(a, b) {
        return a + b;
      }
      var foo;
      `
    ],
    invalid: [
      // // builtin before external module (require)
      {
        code: `
        var async = require('async');
        var fs = require('fs');
        `,
        errors: [
          {...ruleError, message: '`fs` import should occur before import of `async`'}
        ]
      },
      // builtin before external module (import)
      {
        code: `
        import async from 'async';
        import fs from 'fs';
        `,
        errors: [
          {...ruleError, message: '`fs` import should occur before import of `async`'}
        ]
      },
      // builtin before external module (mixed import and require)
      {
        code: `
        var async = require('async');
        import fs from 'fs';
        `,
        errors: [
          {...ruleError, message: '`fs` import should occur before import of `async`'}
        ]
      },
      // external before parent
      {
        code: `
        var parent = require('../parent');
        var async = require('async');
        `,
        errors: [
          {...ruleError, message: '`async` import should occur before import of `../parent`'}
        ]
      },
      // parent before sibling
      {
        code: `
        var sibling = require('./sibling');
        var parent = require('../parent');
        `,
        errors: [
          {...ruleError, message: '`../parent` import should occur before import of `./sibling`'}
        ]
      },
      // sibling before index
      {
        code: `
        var index = require('./');
        var sibling = require('./sibling');
        `,
        errors: [
          {...ruleError, message: '`./sibling` import should occur before import of `./`'}
        ]
      },
      // Multiple errors
      {
        code: `
        var sibling = require('./sibling');
        var async = require('async');
        var fs = require('fs');
        `,
        errors: [
          {...ruleError, message: '`async` import should occur before import of `./sibling`'},
          {...ruleError, message: '`fs` import should occur before import of `./sibling`'}
        ]
      },
      // Uses 'after' wording if it creates less errors
      {
        code: `
        var index = require('./');
        var fs = require('fs');
        var path = require('path');
        var _ = require('lodash');
        var foo = require('foo');
        var bar = require('bar');
        `,
        errors: [
          {...ruleError, message: '`./` import should occur after import of `bar`'}
        ]
      },
      // Overriding order to be the reverse of the default order
      {
        code: `
          var fs = require('fs');
          var index = require('./');
        `,
        options: [{order: ['index', 'sibling', 'parent', 'external', 'builtin']}],
        errors: [
          {...ruleError, message: '`./` import should occur before import of `fs`'}
        ]
      }
    ]
  });
});

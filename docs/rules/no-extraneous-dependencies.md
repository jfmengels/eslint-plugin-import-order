# Forbid the use of extraneous packages

Forbid the import of external modules that are not declared in the `package.json`'s `dependencies` or `devDependencies`.
If no `package.json` is found, the rule will not lint anything.

For the following examples, let's consider the following `package.json`:
```json
{
  "name": "my-project",
  "...": "...",
  "devDependencies": {
    "ava": "^0.13.0",
    "eslint": "^2.4.0",
    "eslint-plugin-ava": "^1.3.0",
    "xo": "^0.13.0"
  },
  "dependencies": {
    "builtin-modules": "^1.1.1",
    "lodash.cond": "^4.2.0",
    "lodash.find": "^4.2.0",
    "pkg-up": "^1.0.0"
  }
}
```

## Fail

```js
var _ = require('lodash');
import _ from 'lodash';

/* eslint import-order/no-extraneous-dependencies: ["error", {"devDependencies": false}] */
import test from 'ava';
var test = require('ava');
```


## Pass

```js
// Non-external modules are fine
var path = require('path');
var foo = require('./foo');

import test from 'ava';
import find from 'lodash.find';
```

## Options

This rule supports the following options:

`devDependencies`: If set to `false`, then `devDependencies` are not allowed. Defaults to `true`.

You can set the options like this:

```js
"import-order/no-extraneous-dependencies": ["error", {"devDependencies": false}]
```

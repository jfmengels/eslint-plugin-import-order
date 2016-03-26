# Enforce a convention in module import order

Enforce a convention in the order of `require()` / `import` statements. The order is as shown in the following example:

```js
// 1. node "builtins"
var fs = require('fs');
var path = require('path');
// 2. "external" modules
var _ = require('lodash');
var chalk = require('chalk');
// 3. modules from a "parent" directory
var foo = require('../foo');
var qux = require('../../foo/qux');
// 4. "sibling" modules from the same or a sibling's directory
var bar = require('./bar');
var baz = require('./bar/baz');
// 5. "index" of the current directory
var main = require('./');
```


## Fail

```js
var _ = require('lodash');
var path = require('path'); // `path` import should occur before import of `lodash`

// -----

import _ from 'lodash';
import path from 'path'; // `path` import should occur before import of `lodash`
```


## Pass

```js
var path = require('path');
var _ = require('lodash');

// -----

import path from 'path';
import _ from 'lodash';
```

## Options

This rule supports the following options:

`order`: The order to respect. It needs to contain only and all of the following elements: `"builtin", "external", "parent", "sibling", "index"`, which is the default value.

You can set the options like this:

```js
"import-order/import-order": [2, {"order": ["index", "sibling", "parent", "external", "builtin"]}]
```

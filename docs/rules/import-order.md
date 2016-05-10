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

Unassigned imports are not accounted for, as the order they are imported in may be important.


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

// -----

// Allowed as ̀`babel-register` is not assigned.
require('babel-register');
var path = require('path');
```

## Options

This rule supports the following options:

`order`: The order to respect. The default order is `"builtin", "external", "parent", "sibling", "index"`. It may be overriden with an array containing any or all of these values. Any value from the default list not appearing in an explicit ordering are appended to the provided list.

You can set the options like this:

```js
"import-order/import-order": [2, {"order": ["index", "sibling", "parent", "external", "builtin"]}]
```

Additionally, you may supply regular expressions within this list, against which import paths will be tested. Paths not matching any rule are subject to the default sorting rules, and are sorted after the regular expression-based rules.

`alphabetize`: Whether to enforce alphabetization of imports within a single sort group. For example, while all `"builtin"` modules must appear before `"external"` modules, this rule will enforce that all `"builtin"` rules are sorted alphabetically with respect to one another.

```js
"import-order/import-order": [2, {"alphabetize": true}]
```

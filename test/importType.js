import test from 'ava';
import {importType} from '../utils';

test('should return "builtin" for node.js modules', t => {
  t.is(importType('fs'), 'builtin');
  t.is(importType('path'), 'builtin');
});

test('should return "external" for non-builtin modules without a relative path', t => {
  t.is(importType('lodash'), 'external');
  t.is(importType('async'), 'external');
  t.is(importType('chalk'), 'external');
  t.is(importType('foo'), 'external');
  t.is(importType('lodash.find'), 'external');
  t.is(importType('lodash/fp'), 'external');
});

test('should return parent for internal modules that go through the parent', t => {
  t.is(importType('../foo'), 'parent');
  t.is(importType('../../foo'), 'parent');
  t.is(importType('../bar/foo'), 'parent');
});

test('should return sibling for internal modules that are connected to one of the siblings', t => {
  t.is(importType('./foo'), 'sibling');
  t.is(importType('./foo/bar'), 'sibling');
});

test('should return "index" for sibling index file', t => {
  t.is(importType('.'), 'index');
  t.is(importType('./'), 'index');
  t.is(importType('./index'), 'index');
  t.is(importType('./index.js'), 'index');
});

test('should return "unknown" for any unhandled cases', t => {
  t.is(importType('/malformed'), 'unknown');
  t.is(importType('   foo'), 'unknown');
});

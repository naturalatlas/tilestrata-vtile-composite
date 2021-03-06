# tilestrata-vtile-composite
[![NPM version](http://img.shields.io/npm/v/tilestrata-vtile-composite.svg?style=flat)](https://www.npmjs.org/package/tilestrata-vtile-composite)
[![Build Status](https://travis-ci.org/naturalatlas/tilestrata-vtile-composite.svg)](https://travis-ci.org/naturalatlas/tilestrata-vtile-composite)
[![Coverage Status](http://img.shields.io/codecov/c/github/naturalatlas/tilestrata-vtile-composite/master.svg?style=flat)](https://codecov.io/github/naturalatlas/tilestrata-vtile-composite)

A [TileStrata](https://github.com/naturalatlas/tilestrata) plugin for compositing vector tiles from multiple layers which are typically from the [tilestrata-vtile](https://github.com/naturalatlas/tilestrata-vtile) plugin. This plugin requires that [node-mapnik](https://github.com/mapnik/node-mapnik) be in your dependency tree.

### Sample Usage

```js
var vtilecomposite = require('tilestrata-vtile-composite');

server.layer('mylayer').route('combined.pbf')
    .use(vtilecomposite([
        ['roads','t.pbf'],
        ['icons','t.pbf']
    ]));
```

## License

Copyright &copy; 2015 [Natural Atlas, Inc.](https://github.com/naturalatlas) & [Contributors](https://github.com/naturalatlas/tilestrata-vtile-composite/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

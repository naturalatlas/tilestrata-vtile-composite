# tilestrata-vtile-composite
Tilestrata plugin from compositing vector tiles from multiple layers
A [TileStrata](https://github.com/naturalatlas/tilestrata) plugin for compositing vector tiles from multiple layers which are typically from the [tilestrata-vtile](https://github.com/naturalatlas/tilestrata-vtile) plugin.

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

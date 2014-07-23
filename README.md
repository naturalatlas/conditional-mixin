# conditional-mixin
[![NPM version](https://badge.fury.io/js/conditional-mixin.png)](http://badge.fury.io/js/conditional-mixin)
[![Build Status](https://travis-ci.org/naturalatlas/conditional-mixin.png?branch=master)](https://travis-ci.org/naturalatlas/conditional-mixin)

Extend objects using the [mixin pattern](http://en.wikipedia.org/wiki/Mixin) with methods that are chosen when called (using a condition defined with each mixin). This is useful for loose-schema models that might have different validation rules or other functionality that depends on its state (like a type id).

```sh
$ npm install conditional-mixin --save
```

### Example

```js
var mixin = require('conditional-mixin');

var Animal = function(type) { this.type = type; };
Animal.prototype.hello = function() { console.log('I am an animal.') };

mixin.apply(Animal, require('./cat.js'));
mixin.apply(Animal, require('./dog.js'));

// cat.js
module.exports = mixin.define({type: 1}, {
    hello: function() {
        console.log('I am a cat.');
    }
});

// dog.js
module.exports = mixin.define({type: 2}, {
    hello: function() {
        console.log('I am a dog.');
    }
});
```

```js
console.log((new Animal(0)).hello()); // "I am an animal."
console.log((new Animal(1)).hello()); // "I am a cat."
console.log((new Animal(2)).hello()); // "I am a dog."
```

### Test Types

When defining a mixin the first argument repesents the condition that should be met in order to use the mixin methods. It can be any of these styles:

- **Callback** (`function`) – Return `true` or `false` from a function to indiciate if the mixin is to be applied. The `this` context will be the same as the candidate method.
- **Property List** (`object`) – Each property will be checked against the instance for strict equality.
- **Omitted** – Operates like a regular mixin. All properties / functions are applied.

### Additional Notes

#### Accessing Original Methods / Properties

From any of the mixin methods, there is a special `_mixinParent()` function that returns all properties before any mixins were applied. Any functions will be bound to the current instance to prevent the need for manual binding. 

```js
module.exports = mixin.define({type: 2}, {
    hello: function() {
        console.log('I am a dog.');
        console.log('More generically, I am a:');
        console.log(this._mixinParent().hello());
    }
});
```

### Test

```sh
$ npm test
```

## License

Copyright &copy; 2014 [Brian Reavis](https://github.com/brianreavis) & [Contributors](https://github.com/naturalatlas/conditional-mixin/graphs/contributors)

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at: http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.


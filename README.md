# Range select polyfil / replacement

'cause they don't work in ie <= 9, and they are inconsistent in proper browsers.

This range input facade will work, and display consistently in ie >= 8,
and modern browsers.

## Usage

### As a polyfill

* Use modernizr or similar to detect range input support

### As a replacement in all browsers

After dom ready call

```javascript
Range.init();
```

### On individual inputs

```javascript
var el = document.getElementById('range');
Range.new(el);
```

### Events stay the same
Bind events to the input element, and as this is just a facade ontop of a real
input element, your events will fire as before.

## Development

### TODO

* make it responsive
* ie testing
* round like real range input. value = min + n * step - test with weird attrs
* correct number of steps - test with weird attrs

* ticks
* transformX over left when possible
* docs
* tests
* refactor
* work out all events


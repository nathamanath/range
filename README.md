# Range select replacement

'cause they don't work in ie <= 9, and they are inconsistent in proper browsers.

The aim of this project is to create a range input facade will work, and display
consistently in ie >= 8 (with events polyfill), and modern browsers.

## Usage

### As a replacement in all browsers

After DOM ready call

```javascript
Range.init();
```

### On individual inputs

```javascript
var el = document.getElementById('range');
Range.new(el);
```

### As a polyfill

* [polyfill
  events](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener)
* Use modernizr or similar to detect range input support.
* Apply as above.

### Events stay the same

Bind events to the real input element, and as this is just a facade ontop of an
input element, your events will fire as before.

## Development

### TODO:

* drag and drop not working in ie8
* transformX over left when possible
* better docs
* tests
* refactor quite a bit
* work out all required events
* keypress support
* list attr support
* should stay up to date when range input is updated programmatically


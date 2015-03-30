# Range select replacement

'cause they don't work in ie <= 9, and they are inconsistent in proper browsers.

The aim of this project is to create a range input facade will work, and display
consistently in ie >= 9 (with eventListener polyfill), and modern browsers.

Currently ie 8 is not fully supported, however range.js mostly works there too.
This will be fixed in a future release.

## Usage

### As a replacement in all browsers

After DOM ready call

```javascript
Range.init();
```

### On individual inputs

```javascript
var el = document.getElementById('range');
Range.create(el);
```

### As a polyfill

* [polyfill
  event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener)
* Use modernizr or similar to detect range input support.
* Apply as above.

Ie < 9 does not support the input event. Bind to `element.oninput` for ie8 instead.

### Events stay the same

Bind events to the real input element, and as this is just a facade ontop of an
input element, your events will fire as before. (Currently change, input
mousedown, mouseup, mosemove, and click are implemented. The others are coming soon).

## Development

### Building
* set $CLOSURE\_PATH environment variable to closure compiler jar path
* `rake build`

### TODO:

* tests
* work out all required events
* key press support
* list attr support
* drag and drop not working in ie8


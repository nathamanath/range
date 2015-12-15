# HTML5 range input replacement

'cause they don't work in ie <= 9, and they are inconsistent in proper browsers.

The aim of this project is to create a range input facade will work, and display
consistently in ie >= 9 (with eventListener polyfill), and modern browsers.

Currently ie 8 is not fully supported. This will be fixed in a future release.

## Usage

### As a replacement in all browsers

After DOM ready call

```javascript
Range.init(ranges, args);
```

where ranges is optional. Ranges can be a selector string, a nodelist/array of
dom nodes, or a dom node. Ranges defaults to `'input[type=range]'` and args is an arguments object.

### As a polyfill

* [polyfill
  event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener)
* Use modernizr or similar to detect range input support.
```javascript
  Modernizr.load({
    test: Modernizr.inputtypes.range,
    nope: ['range.js', 'range-init.js']
  })
```

* where `range-init.js` initializes range (see above)

Ie < 9 does not support the input event. Bind to `element.oninput` for ie8 instead.

### Events stay the same

Bind events to the real input element, and as this is just a facade ontop of an
input element, your events will fire as before.

## Development

### Building
* jsdoc is required to build docs.
* set $CLOSURE_PATH environment variable to closure compiler jar path
* `$CLOSURE_PATH=<path to closure compiler> rake build`

### TODO
* when in range mode, set initial value for both pointers.
* handle range input offset when setting dimensions of selected area
* nice defaults for pointers
* useful test suite
* AMD source
* allow multiple pointers per range

#### Later

* divide into modules
* more tests
* work out all required events

### Known issues

* tabindex not woking in ie8
* keyboard input does not work in ie8
* Drag and drop not working in ie8.
* When I focus on one range, and then I focus on another, focus and blur events
  are in wrong order.


# HTML5 range input replacement

'cause they are inconsistent browsers.

The aim of this project is to create a range input facade will work, and display
consistently in ie >= 9 (with eventListener polyfill), and modern browsers.


## Usage

```html
  <input type="range">
```

```javascript
  Range.init('input[type=range]');
```

See `examples/index.html` for more usage examples.

* [polyfill
  event listeners](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener?redirectlocale=en-US&redirectslug=DOM%2FEventTarget.addEventListener) for ie9

### Events stay the same

Bind events to the real input element, and as this is just a facade ontop of an
input element, your events will fire as before.

## Development

clone repo, run `npm install`

### Building

`npm run build`

### TODO

* useful test suite
* docs

### Known issues

* When I focus on one range, and then I focus on another, focus and blur events
  are in wrong order.

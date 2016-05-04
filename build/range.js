/** Range.js 0.0.17 | License: MIT */
;(function (root, factory) { 
  if (typeof define === 'function' && define.amd) { 
    define(factory); 
  } else { 
    root.Range = factory(); 
  } 
}(this, function() {
'use strict';
var pointer, event, range, main;
pointer = function () {
  var CSS_PREFIX = 'range-replacement-';
  var ACTIVE_CLASS = 'is-active';
  /**
   * Represents a point (selected value) for a range input
   *
   * @class Point
   */
  return function () {
    var Klass = function (args) {
      this._value = this._oldValue = args.value;
      this._width = args.width;
      this._track = args.track;
    };
    /** @lends Point */
    Klass.prototype = {
      constructor: 'Pointer',
      init: function () {
        this._el = this._template();
        return this;
      },
      activate: function () {
        this._el.classList.add(ACTIVE_CLASS);
      },
      deactivate: function () {
        this._el.classList.remove(ACTIVE_CLASS);
      },
      /** @returns pointer html element */
      // TODO: Point value within point template
      _template: function () {
        var pointer = document.createElement('div');
        var style = pointer.style;
        pointer.className = CSS_PREFIX + 'point';
        style.position = 'absolute';
        var pointerWidth = this._width;
        if (!!pointerWidth) {
          style.width = pointerWidth + 'px';
        }
        this._el = pointer;
        return pointer;
      },
      /**
       * gets / sets value
       *
       * @param value - number to replace value
       * @returns value of point
       */
      value: function (value) {
        if (arguments.length) {
          this._oldValue = this._value;
          this._value = parseFloat(value);
        }
        return this._value;
      },
      oldValue: function () {
        return this._oldValue;
      },
      /**
       * gets / sets width
       *
       * @param width - number to replace width
       * @returns width of point
       */
      width: function (width) {
        if (arguments.length) {
          this._width = parseFloat(width);
          this._el.style.width = this._width + 'px';
        }
        return this._el.offsetWidth;
      },
      // TODO: this should be on track object
      /** Set left position (in percent) of pointer */
      left: function (percent) {
        if (arguments.length) {
          this._left = this._el.style.left = percent + '%';
        }
        return this._left || '0';
      },
      x: function () {
        return this._el.getBoundingClientRect().left;
      },
      /** append point html to track */
      render: function () {
        this._track.appendChild(this._el);
        return this;
      }
    };
    return Klass;
  }();
}();
event = {
  /**
   * Lazily evaluates which create method needed
   * @param eventName
   * @param [eventType=HTMLEvents] - type of event
   */
  create: function (eventName, eventType) {
    var method;
    var self = this;
    eventType = eventType || 'HTMLEvents';
    if (document.createEvent) {
      method = function (eventName) {
        var event = document.createEvent(eventType);
        // dont bubble
        event.initEvent(eventName, false, true);
        return event;
      };
    } else {
      // ie < 9
      // BUGFIX: Infinite loop on keypress in ie8
      method = function (eventName, eventType) {
        var _event = document.createEventObject(window.event);
        _event.cancelBubble = true;
        _event.eventType = eventName;
        return _event;
      };
    }
    self.create = method;
    return method(eventName);
  },
  /**
   * Lazily evaluates which fire event method is needed
   * @param el
   * @param eventName
   */
  fire: function (el, eventName, eventType, code) {
    var method;
    var self = this;
    if (document.createEvent) {
      method = function (el, eventName, eventType, code) {
        var event = self.create(eventName, eventType);
        if (eventType === 'KeyboardEvent') {
          var get = {
            get: function () {
              return code;
            }
          };
          var defineProperty = Object.defineProperty;
          defineProperty(event, 'which', get);
          defineProperty(event, 'keyCode', get);
        }
        el.dispatchEvent(event);
      };
    } else {
      // ie < 9
      method = function (el, eventName, eventType, code) {
        var onEventName = [
          'on',
          eventName
        ].join('');
        if (eventName !== 'input') {
          // Existing ie < 9 event name
          var _event = self.create(eventName);
          _event.keyCode = code;
          el.fireEvent(onEventName, _event);
        } else if (el[onEventName]) {
          // TODO: nicer input event handling for ie8
          el[onEventName]();
        }
      };
    }
    self.fire = method;
    method(el, eventName);
  }
};
range = function (Pointer, Event) {
  var DEFAULT_POINTERS = 1;
  var DEFAULT_RANGE_MAX = 100;
  var DEFAULT_RANGE_MIN = 0;
  var DEFAULT_RANGE_STEP = 1;
  var CSS_PREFIX = 'range-replacement-';
  /**
   * Represents a range input
   *
   * @class Range
   * @param {object} el - range input to recieve facade
   * @param {object} [args]
   * @param {string} [args.pointerWidth] - See `.init`
   * @param {boolean|array} [args.ticks] - set ticks via js instaead of list
   * if you like. true will put a tick on each step, array of numbers will put
   * a tick on each value in array (similar to datalist).
   * @param {number} [args.max=100] - alternate max setter
   * @param {number} [args.min=0] - alternate min setter
   * @param {number} [args.step=1] - alternate step setter
   */
  var Range = function (el, args) {
    var self = this;
    self.input = el;
    self.args = args || {};
    self._mode = !!self.args['range'] ? 'RANGE' : 'NUMBER';
    self.value = parseFloat(el.value);
    self.max = parseFloat(el.getAttribute('max')) || self.args['max'] || DEFAULT_RANGE_MAX;
    self.min = parseFloat(el.getAttribute('min')) || self.args['min'] || DEFAULT_RANGE_MIN;
    self.step = parseFloat(el.getAttribute('step')) || self.args['step'] || DEFAULT_RANGE_STEP;
  };
  /** @memberof Range */
  Range.prototype = {
    constructor: 'Range',
    /**
     * Initialize range replacements
     * @example new Range(args).init();
     *
     * @param {boolean} [silent=false] - do not fire change / input events
     * on init. handy when asynchronously setting value
     */
    'init': function (silent) {
      this._pointers = [];
      this._render();
      this._bindEvents();
      this._handleTicks();
      this._setPointerValues();
      this._lastPointer = this._pointers[0];
      return this;
    },
    /** Set pointer values from input value */
    _setPointerValues: function () {
      // if input has no value set default for mode.
      var values = this.input.value.split(',');
      for (var i = 0, l = values.length; i < l; i++) {
        this._setValue(this._pointers[i], values[i], true);
      }
    },
    _handleTicks: function () {
      var ticks = this.args.ticks;
      if (ticks) {
        if (Object.prototype.toString.call(ticks) === '[object Array]') {
          this._generateTicks(ticks);
        } else if (!!ticks) {
          // make array of possible values
          ticks = [];
          for (var i = this.min, l = this.max; i < l; i += this.step) {
            ticks.push(i);
          }
          this._generateTicks(ticks);
        }
      } else {
        this._list();
      }
    },
    /**
     * Handle list attribute if set
     * @private
     */
    _list: function () {
      var listId, list, options;
      var ticks = [];
      if (listId = this.input.getAttribute('list')) {
        // get point values
        if (list = document.getElementById(listId)) {
          options = list.querySelectorAll('option');
          for (var i = 0, l = options.length; i < l; i++) {
            ticks.push(parseInt(options[i].innerHTML, 10));
          }
          this._generateTicks(ticks);
        }
      }
    },
    /**
     * Render range replacement in place of old input el
     * @private
     */
    _render: function () {
      var input = this.input;
      this.el = this._template();
      input.style.display = 'none';
      input.parentNode.insertBefore(this.el, input.nextSibling);
      this._getDimensions();
      var pointerWidth = this._getPointerWidth();
      this._pointers.forEach(function (pointer) {
        pointer.width(pointerWidth);
      });
      this.track.style.paddingRight = pointerWidth;
    },
    /**
     * generate all html required for tick marks. If ticks array is not
     * provided, generate tick at each step.
     * @private
     * @param {array} [ticks] - values to put ticks on
     */
    _generateTicks: function (ticks) {
      var el = document.createElement('div');
      var inner = this._generateTicksInner();
      el.appendChild(inner);
      el.className = 'ticks';
      this._generateTickEls(ticks, inner);
      this.ticks = el;
      this.el.appendChild(this.ticks);
      this._styleTicks(el);
    },
    /**
     * @private
     * @param ticks - ticks element
     */
    _styleTicks: function (ticks) {
      var style = ticks.style;
      style.padding = [
        '0',
        this.pointerWidth / 2,
        'px'
      ].join('');
      style.width = '100%';
      style.position = 'absolute';
    },
    /**
     * @private
     * @returns inner wrapper element for tick els
     */
    _generateTicksInner: function () {
      var inner = document.createElement('div');
      var style = inner.style;
      inner.className = 'ticks-inner';
      style.width = '100%';
      style.position = 'relative';
      return inner;
    },
    /**
     * @private
     * @param {object} inner - element which contains ticks
     * @returns el containing all tick marks
     */
    _generateTickEls: function (values, inner) {
      var offset;
      var value;
      for (var i = 0; i < values.length; i++) {
        value = values[i];
        // scale value between min and max
        offset = this._scale(value, [
          this.min,
          this.max
        ], [
          0,
          100
        ]);
        inner.appendChild(this._generateTick(offset, value));
      }
    },
    /**
     * @private
     * @param {integer} offset - tick offset in %
     * @returns individual tick mark element
     */
    _generateTick: function (offset, value) {
      var tick = document.createElement('div');
      tick.className = 'tick';
      tick.innerHTML = value;
      tick.style.position = 'absolute';
      tick.style.left = offset + '%';
      return tick;
    },
    _generateSelected: function () {
      var selected = document.createElement('div');
      selected.className = CSS_PREFIX + 'selected';
      selected.style.position = 'absolute';
      return selected;
    },
    /**
     * Get input facade offset and dimensions
     * @private
     */
    _getDimensions: function () {
      var rect = this.el.getBoundingClientRect();
      this.xMin = rect.left;
      this.xMax = rect.right - this.xMin;
    },
    /**
     * @private
     * @returns {string} pointer width in px
     */
    _getPointerWidth: function () {
      this.pointerWidth = this.args['pointerWidth'] || this._pointers[0].offsetWidth;
      return this.pointerWidth + 'px';
    },
    /**
     * HTML for entire range facade
     * @private
     * @returns {object} All input facade html
     */
    _template: function () {
      var el = this._rangeEl();
      var totalPointers = this._mode === 'RANGE' ? 2 : 1;
      this.track = this._trackEl();
      this._selectedEl = this._generateSelected();
      this.track.appendChild(this._selectedEl);
      var point;
      for (var i = 0, l = totalPointers; i < l; i++) {
        point = new Pointer({
          track: this.track,
          width: this.pointerWidth,
          value: null
        }).init().render();
        this._pointers.push(point);
      }
      el.appendChild(this.track);
      // TODO: _preventSelection?!?
      el.addEventListener('selectstart', function (e) {
        e.preventDefault();
      });
      return el;
    },
    /**
     * @private
     * @returns Range replacement wrapper element
     */
    _rangeEl: function () {
      var el = document.createElement('div');
      var width = this.pointerWidth || 0;
      var style = el.style;
      el.className = 'range-replacement';
      el.setAttribute('tabindex', 0);
      style.position = 'relative';
      style.paddingRight = [
        width,
        'px'
      ].join('');
      return el;
    },
    /**
     * @private
     * @returns Generated track el
     */
    _trackEl: function () {
      var track = document.createElement('div');
      track.className = 'track';
      return track;
    },
    /**
     * @private
     * @returns Generated pointer el
     */
    _pointerEl: function () {
      return new Pointer({
        width: this.pointerWidth,
        value: 50
      }).init();
    },
    /**
     * Binds events for range replacement to work
     * @private
     */
    _bindEvents: function () {
      var self = this;
      var el = self.el;
      var events;
      el.addEventListener('focus', function (e) {
        self._focus(e);
      });
      el.addEventListener('mousedown', function (e) {
        var code = e.keyCode || e.which;
        // left mousedown only
        // `|| (!code && e.keyCode == 0)` for ie8
        if (code === 1) {
          var events = [
            'mousedown',
            'mousemove',
            'mouseup'
          ];
          self._dragStart(e, events, self._getMouseX);
        }
        // not bound to focus event 'cause ie
        self._focus(e);
      });
      el.addEventListener('touchstart', function (e) {
        events = [
          'touchstart',
          'touchmove',
          'touchend'
        ];
        self._dragStart(e, events, self._getTouchX);
      });
      el.addEventListener('mouseup', function () {
        self._dragEnd('mouseup');
      });
      el.addEventListener('touchend', function () {
        self._dragEnd('touchend');
      });
    },
    /**
     * Handle focus
     * @private
     * @fires this.input#focus
     * @fires this.input#keyup
     */
    _focus: function () {
      var self = this;
      if (!self.hasFocus) {
        self.hasFocus = true;
        Event.fire(self.input, 'focus');
        self.keydown = function (e) {
          self._keydown(e);
        };
        self.keyup = function (e) {
          Event.fire(self.input, 'keyup', 'KeyboardEvent', e.keyCode || e.charCode);
        };
        self.blur = function (e) {
          self._clickBlur(e);
        };
        document.addEventListener('keydown', self.keydown);
        document.addEventListener('keyup', self.keyup);
        window.addEventListener('mousedown', self.blur);
      }
    },
    /**
     * Called when focused on range replacement and keydown
     * @private
     * @param e - keydown event
     * @fires this.input#keydown
     */
    _keydown: function (e) {
      // TODO: cache which is in use
      var code = e.keyCode || e.charCode;
      var self = this;
      var pointer = self._lastPointer;
      // left or down arrow
      if (code === 40 || code === 37) {
        self._setValue(pointer, pointer.value() - self.step);
      }  // right or up arrow
      else if (code === 38 || code === 39) {
        self._setValue(pointer, pointer.value() + self.step);
      }  // tab
      else if (code === 9) {
        self._blur();
      }
      Event.fire(this.input, 'keydown', 'KeyboardEvent', code);
    },
    /**
     * @private
     * @param e - click event
     */
    _clickBlur: function (e) {
      var self = this, input = self.input, el = self.el,
        // All els which wont cause blur if clicked
        _els = el.querySelectorAll('*'), els = [];
      // nodelist to array
      for (var i = 0, l = _els.length; i < l; i++) {
        els.push(_els[i]);
      }
      els.push(el, input);
      // if not clicking on this.el / descendants
      if (els.indexOf(e.target) < 0) {
        self._blur();
      }
    },
    /**
     * Handle blur event on range replacement
     * @private
     * @fires this.input#blur
     */
    _blur: function () {
      var self = this;
      self.hasFocus = false;
      window.removeEventListener('mousedown', self.blur);
      document.removeEventListener('keydown', self.keydown);
      document.removeEventListener('keyup', self.keyup);
      Event.fire(self.input, 'blur');
    },
    /**
     * update element dimensions, reset value and pointer position
     * to that of this.input
     * @param {boolean} silent - supress change + input event
     * @returns Range instance
     */
    'update': function (silent) {
      this.value = this._roundAndLimit(parseFloat(this.input.value));
      this._getDimensions();
      this._setValue(this._pointers[0], this.value, silent);
      return this;
    },
    /**
     * Stop user from selecting anything
     * @private
     */
    _preventSelection: function () {
      var method;
      var self = this;
      if (typeof self.el.onselectstart !== 'undefined') {
        method = function () {
          document.body.style.cursor = 'default';
          window.addEventListener('selectstart', self.noSelect = function (e) {
            e.preventDefault();
          });
        };
      } else {
        method = function () {
          var style = document.body.style;
          style.cursor = 'default';
          style.MozUserSelect = 'none';
        };
      }
      self._preventSelection = method;
      method();
    },
    /**
     * Un-prevent selection
     * @private
     */
    _allowSelection: function () {
      var method;
      var self = this;
      if (typeof self.el.onselectstart !== 'undefined') {
        method = function () {
          document.body.style.cursor = '';
          window.removeEventListener('selectstart', self.noSelect);
        };
      } else {
        method = function () {
          var style = document.body.style;
          style.cursor = '';
          style.MozUserSelect = '';
        };
      }
      self._allowSelection = method;
      method();
    },
    /**
     * Handle pointer drag for either touch or mouse
     * @private
     * @param {object} e - move event
     * @param {array} eventNames - names of required events
     * @param {function} getX - method which returns x position of event
     * @fires this.input#mousedown
     * @fires this.input#touchstart
     */
    _dragStart: function (e, events, getX) {
      var self = this;
      var onMove, onUp;
      var moveEvent = events[1];
      var endEvent = events[2];
      // Get closest pointer... this is the one we are moving
      var x = getX.call(self, e);
      // we move the point closest to dragstart
      var point = this._pointers.sort(function (a, b) {
        return Math.abs(x - a.x()) > Math.abs(x - b.x());
      })[0];
      point.activate();
      self.oldValue = self.value;
      self._input(point, getX.call(self, e));
      window.addEventListener(moveEvent, onMove = function (e) {
        self._input(point, getX.call(self, e));
      });
      self._preventSelection();
      window.addEventListener(endEvent, onUp = function () {
        self._change();
        window.removeEventListener(moveEvent, onMove);
        window.removeEventListener(endEvent, onUp);
        self._allowSelection();
        document.body.style.cursor = '';
      });
      // touchstart || mousedown
      // TODO: not firing in ie8
      Event.fire(self.input, events[0]);
    },
    /**
     * Handle end of pointer drag (touch or mouse)
     * @private
     * @param {string} endEventName
     * @fires this.input#click
     * @fires this.input#mouseup
     * @fires this.input#touchend
     */
    _dragEnd: function (endEventName) {
      this._change();
      this._pointers.forEach(function (pointer) {
        pointer.deactivate();
      });
      Event.fire(this.input, endEventName);
      Event.fire(this.input, 'click');
    },
    /**
     * Get x position of mouse during event
     * Lazily evaluate which method needed
     *
     * @private
     * @param {object} e - event instance
     */
    _getMouseX: function (e) {
      var method;
      if (typeof window.event === 'undefined') {
        method = function (e) {
          return e.pageX;
        };
      } else {
        method = function () {
          return window.event.clientX;
        };
      }
      this._getMouseX = method;
      return method(e);
    },
    /**
     * Get mouse x position during touch event
     * @private
     * @param e - touch event
     */
    _getTouchX: function (e) {
      return e.changedTouches[0].clientX;
    },
    /**
     * Handle input event for range replacement
     * @private
     * @param x - input event x position
     */
    _input: function (point, x) {
      // OPTIMIZE: How not to call this each time?
      // or cache results.
      this._getDimensions();
      var offsetX = x - this.xMin;
      var from = [
        0,
        this.xMax
      ];
      var to = [
        this.min,
        this.max
      ];
      var scaled = this._scale(offsetX, from, to);
      this._setValue(point, scaled);
    },
    /**
     * Sets value of both this.input and range replacement
     * @private
     * @param {number} value
     * @param {boolean} silent - no inPut or change event
     * @fires this.input#input
     */
    _setValue: function (pointer, value, silent) {
      var self = this;
      self._lastPointer = pointer;
      value = self._roundAndLimit(value);
      // set pointer position only when value changes
      if (value !== pointer.oldValue()) {
        pointer.value(value);
        self.oldInputValue = self.newValue = value;
        self.input.value = self.inputValue();
        var min = self.min;
        var percent = (value - min) / (self.max - min) * 100 || 0;
        // TODO: how should left be set
        pointer.left(percent);
        // Do not fire event on first call (initialisation) or if silent
        if (self.oldValue && !silent) {
          Event.fire(self.input, 'input');
        }
        self._updateSelected();
        self._change(silent);
      }
    },
    /** position selected el */
    _updateSelected: function () {
      if (this._mode === 'RANGE') {
        this._updateRangeSelected();
      } else if (this._mode === 'NUMBER') {
        this._updateNumberSelected();
      }
    },
    /** selected spans from left of track to center of pointer */
    _updateNumberSelected: function () {
      var selected = this._selectedEl;
      selected.style.left = 0;
      selected.style.width = this._pointers[0].left();
    },
    /** selected spans from center of lowest pointer to center of other pointer */
    _updateRangeSelected: function () {
      var selected = this._selectedEl;
      var pointers = this._pointers;
      var sorted = [
        0,
        1
      ].sort(function (a, b) {
        return pointers[a].value() > pointers[b].value();
      });
      selected.style.left = pointers[sorted[0]].left();
      selected.style.width = parseInt(pointers[sorted[1]].left()) - parseInt(pointers[sorted[0]].left()) + '%';
    },
    /**
     * Handle change of value if changed
     * @private
     * @param {boolean} silent - no change event
     */
    _change: function (silent) {
      var newValue = this.inputValue();
      var input = this.input;
      if (this.oldValue !== newValue) {
        input.value = this.oldValue = this.value = newValue;
        if (!silent) {
          Event.fire(input, 'change');
        }
      }
    },
    inputValue: function () {
      var value;
      var mode = this._mode;
      if (mode === 'NUMBER') {
        value = this._numberValue();
      }
      if (mode === 'RANGE') {
        value = this._rangeValue();
      }
      return value;
    },
    /** @returns vallue of range in number mode (default) */
    _numberValue: function () {
      return this._pointers[0].value();
    },
    /** returns value of range in range mode */
    _rangeValue: function () {
      var values = this._pointers.map(function (pointer) {
        return pointer.value();
      });
      return values.sort(function (a, b) {
        return a > b;
      });
    },
    /**
     * Round to nearest step limit between min and max
     * Also ensure same decimal places as step for ie <= 9's sake. >:0
     *
     * @private
     * @param {number} n
     */
    _roundAndLimit: function (n) {
      var step = this.step;
      // count # of decimals in this.step
      var decimals = (step + '').split('.')[1];
      var places = decimals ? decimals.length : 0;
      var rounded = (Math.round(n / step) * step).toFixed(places);
      return Math.min(Math.max(rounded, this.min), this.max);
    },
    /**
     * @private
     * @param {number} value - number to be rounded
     * @param {array} rangeFrom - Source range: [srcLow, srcHigh]
     * @param {array} rangeTo - Destination range: [destLow, destHigh]
     * @returns {number} - value scaled between destLow, and destHigh
     */
    _scale: function (value, rangeFrom, rangeTo) {
      var srcLow = rangeFrom[0];
      var destLow = rangeTo[0];
      var destHigh = rangeTo[1];
      var preMapped = (value - srcLow) / (rangeFrom[1] - srcLow);
      return preMapped * (destHigh - destLow) + destLow;
    }
  };
  return Range;
}(pointer, event);
main = function (Range) {
  return {
    /**
     * @memberof Range
     *
     * @static
     * @param {string|array|object} [ranges=input[type=range]] - css selector,
     * nodelist/array, or dom node to be replaced.
     * @param {object} args - arguments object
     * @param {number} args.pointerWidth - static value for pointer width.
     * Needed if range replacement is origionaly renered with `display: none`
     * @param silent - see #init
     * @param {boolean} args.range - select range of numbers, or a number from a range
     *
     * @returns {object|array} Range instance(s)
     */
    init: function (ranges, args, silent) {
      ranges = ranges || 'input[type=range]';
      var replacements = [];
      if (typeof ranges === 'string') {
        // selector string
        ranges = document.querySelectorAll(ranges);
      } else if (typeof ranges.length === 'undefined') {
        // dom node
        return new Range(ranges, args).init(silent);
      }
      for (var i = 0, l = ranges.length; i < l; i++) {
        replacements.push(new Range(ranges[i], args).init(silent));
      }
      return replacements;
    }
  };
}(range);
  return main;
}));

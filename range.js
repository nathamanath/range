(function(document, window) {
  'use strict';

  /**
   * Helpers to make old ie work
   */
  var Helpers = {
    _eventMethods: (function() {
      var out;

      if(window.addEventListener !== 'undefined') {
        out = ['addEventListener', 'removeEventListener'];
      } else {
        out = ['attachEvent', 'detachEvent'];
      }

      return out;
    })(),

    /** shim addEventListener */
    addEvent: function(el, e, fn) {
      el[this._eventMethods[0]](e, fn, true);
    },

    removeEvent: function(el, e, fn) {
      el[this._eventMethods[1]](e, fn, true);
    },

    /** custom event cache */
    _events: {},

    createEvent: function(eventName) {
      var event;

      if (document.createEvent) {
        event = document.createEvent("HTMLEvents");
        event.initEvent(eventName, true, true);
      } else {
        event = document.createEventObject();
        event.eventType = eventName;
      }

      event.eventName = eventName;

      this._events[eventName] = event;

      return event;
    },

    /**
     * @param el {object} - dom node to recieve event
     * @param eventName {string} - name of event to fire
     */
    fireEvent: function(el, eventName) {
      var event = this._events[eventName] || this.createEvent(eventName);

      if (document.createEvent) {
        el.dispatchEvent(event);
      } else {
        el.fireEvent("on" + event.eventType, event);
      }
    },

    redraw: function(el) {
      return el.offsetHeight;
    }
  };

  var Range = function(el) {
    this.input = el;

    this.value = parseFloat(el.value);
    this.max = parseFloat(el.getAttribute('max')) || 100;
    this.min = parseFloat(el.getAttribute('min')) || 0;
    this.step = parseFloat(el.getAttribute('step')) || 1;

    this.mouseDown = false;
  }

  Range.prototype = {
    init: function() {

      this._render();
      this._bindEvents();
      this._setValue(this.value);

      return this;
    },

    _render: function() {
      this.input.style.opacity = 0;
      this.input.style.position = 'absolute';

      this.input.parentNode.insertBefore(this._template(), this.input.nextSibling);

      Helpers.redraw(this.pointer);

      this.pointerWidth = this.pointer.offsetWidth;

      var rect = this.el.getBoundingClientRect();

      this.xMin = rect.left;
      this.xMax = rect.right - this.xMin;
    },

    _template: function() {
      this.el = document.createElement('div');
      this.el.className = 'range-replacement';
      this.el.style.position = 'relative';

      this.pointer = document.createElement('div');
      this.pointer.className = 'point';
      this.pointer.style.position = 'absolute';

      this.el.appendChild(this.pointer)

      return this.el;
    },

    _bindEvents: function() {
      var that = this;

      Helpers.addEvent(this.el, 'mousedown', function(e) { that._onMouseDown(e); });
      Helpers.addEvent(this.el, 'mouseup', function(e) { that._onMouseUp(e); });
    },

    _onMouseDown: function(e) {
      this.oldValue = this.value;

      this._input(e);

      Helpers.fireEvent(this.input, 'mousedown');

      var that = this;

      var mouseUpdate = function(e) {
        that._input(e);
        that._change();

        if(that.mouseDown) {
          mouseUpdate(e);
        }
      };

      var onMove = function(e) {
        that._input(e);
      };

      var onUp = function(e) {
        that._change();
        Helpers.removeEvent(window, 'mousemove',  onMove);
        Helpers.removeEvent(window, 'mouseup', onUp);
      }

      Helpers.addEvent(window, 'mousemove',  onMove);
      Helpers.addEvent(window, 'mouseup', onUp);
    },

    _onMouseUp: function(e) {
      this._input(e);
      this._change();

      // stop updating
      Helpers.fireEvent(this.input, 'mouseup');
      Helpers.fireEvent(this.input, 'click');
    },

    _input: function(e) {
      var x = (window.Event) ? e.pageX : Event.clientX;

      var value = parseFloat(this._scale(x - this.xMin, 0, this.xMax - this.pointerWidth, this.min, this.max));

      this._setValue(value);

      if(this.oldValue !== this.value) {
        Helpers.fireEvent(this.input, 'input');
      }
    },

    _setValue: function(value) {
      // round to nearest step + min limit between min and max
      var rounded = this._round(value);
      var limited = this._limitToRange(rounded);
      this.newValue = limited;

      // set pointer position
      var maxLeft = this.xMax - this.pointerWidth;

      // TODO: should be correct number of steps. one per possible value
      var left = this._scale(limited, this.min, this.max, 0, maxLeft);

      this.pointer.style.left = left + 'px';
    },

    _change: function() {
      if(this.oldValue !== this.newValue) {
        this.value = this.newValue;

        this.input.value = this.oldValue = this.value;

        Helpers.fireEvent(this.input, 'change');
      }
    },

    _limitToRange: function(n) {
      return this._limit(n, this.max, this.min);
    },

    _limit: function(n, max, min) {
      return Math.min(Math.max(n, min), max);
    },

    /**
     * @param {number} value - number to be rounded
     * @param {number} srcLow - min value
     * @param {number} srcHigh - max value
     * @param {number} destLow - min output
     * @param {number} destHigh - max output
     * @returns {number} - value scaled between destLow, and destHigh
     */
    _scale: function(value, srcLow, srcHigh, destLow, destHigh) {
      return ((value - srcLow) / (srcHigh - srcLow)) * (destHigh - destLow) + destLow;
    },

    /**
     * @param {number} n - to be rounded
     * @returns {integer} - n rounded to nearest this.step
     */
    _round: function(n) {
      return Math.round(n / this.step) * this.step;
    }
  };

  /**
   * Apply Range to single range input
   *
   * @returns {object} - Range instance
   */
  Range.new = function(el) {
    return new Range(el).init();
  };

  /**
   * Apply to all range inputs
   *
   * @returns {array} - Range instances
   */
  Range.init = function(selector) {
    selector = selector || 'input[type=range]'
    var els = document.querySelectorAll(selector);
    var ranges = [];

    for(var i = 0, el; el = els[i]; i++) {
      ranges.push(Range.new(el));
    }

    return ranges;
  };

  // expose just what is needed
  var out = {
    new: Range.new,
    init: Range.init
  };

  var define = window['define'] || null;

  if(typeof define === 'function' && define['amd']) {
    define('range', [], function(){ return out; });
  } else {
    window.Range = out;
  }

})(document, window);


/**
 * @fileoverview Range input replacement
 * @author NathanG
 * @license MIT
 * @version 0.0.1
 */

(function(document, window) {
  'use strict';

  /**
   * Helper methods
   */
  var H = {
    /** custom event cache */
    _events: {},

    /**
     * @param eventName {string} - name of event to be created
     */
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

    paint: function(el) {
      return el.offsetHeight;
    }
  };

  /**
   * Represents a range input
   *
   * @class Range
   * @param el {object} - range input to recieve facade
   */
  var Range = function(el) {
    this.input = el;

    this.value = parseFloat(el.value);
    this.max = parseFloat(el.getAttribute('max')) || 100;
    this.min = parseFloat(el.getAttribute('min')) || 0;
    this.step = parseFloat(el.getAttribute('step')) || 1;

    this.mouseDown = false;
  }

  /** @memberof Range */
  Range.prototype = {
    init: function() {
      this._render();
      this._bindEvents();
      this._setValue(this.value);

      return this;
    },

    _render: function() {
      var input = this.input;

      input.style.display = 'none';

      input.parentNode.insertBefore(this._template(), input.nextSibling);

      this._getDimensions();
    },

    _getDimensions: function() {
      H.paint(this.pointer);
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

      this.el.addEventListener('mousedown', function(e) {
        that._onMouseDown(e);
      });

      this.el.addEventListener('mouseup', function(e) {
        that._onMouseUp(e);
      });

      // TODO: Share resize event across all instances + throtle
      window.addEventListener('resize', function(e) {
        that._onResize(e);
      })
    },

    _onResize: function(e) {
      this._getDimensions();
      this._setValue(this.value);
    },

    _onMouseDown: function(e) {
      this.oldValue = this.value;

      this._input(e);

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

        window.removeEventListener('mousemove',  onMove);
        window.removeEventListener('mouseup', onUp);
      }

      window.addEventListener('mousemove',  onMove);
      window.addEventListener('mouseup', onUp);

      H.fireEvent(this.input, 'mousedown');
    },

    _onMouseUp: function(e) {
      this._change();

      // stop updating
      H.fireEvent(this.input, 'mouseup');
      H.fireEvent(this.input, 'click');
    },

    _input: function(e) {
      var x = (typeof e.pageX !== 'undefined') ? e.pageX : window.event.clientX;

      var value = parseFloat(this._scale(x - this.xMin, 0, this.xMax - this.pointerWidth, this.min, this.max));

      this._setValue(value);

      // TODO: ie8 dosent like doing this...
      H.fireEvent(this.input, 'input');
    },

    _setValue: function(value) {
      // round to nearest step limit between min and max
      var rounded = this._round(value);
      var limited = this._limitToRange(rounded);
      this.newValue = limited;
      this.input.value = this.newValue;

      // set pointer position
      var maxLeft = this.xMax - this.pointerWidth;

      // TODO: should be correct number of steps. one per possible value
      var left = this._scale(limited, this.min, this.max, 0, maxLeft) || 0;

      this.pointer.style.left = [parseInt(left), 'px'].join('');
    },

    _change: function() {
      if(this.oldValue !== this.newValue) {
        this.value = this.newValue;

        this.input.value = this.oldValue = this.value;

        H.fireEvent(this.input, 'change');
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

  // expose just what is needed
  var out = {
    'new': function(el) {
      return new Range(el).init();
    },
    'init': function(selector) {
      selector = selector || 'input[type=range]'
      var els = document.querySelectorAll(selector);
      var ranges = [];

      for(var i = 0, el; el = els[i]; i++) {
        ranges.push(this['new'](el)); // 'cause ie8
      }

      return ranges;
    }
  };

  var define = window['define'] || null;

  if(typeof define === 'function' && define['amd']) {
    define('range', [], function(){ return out; });
  } else {
    window.Range = out;
  }

})(document, window);


define([],
  function() {

  'use strict';

  var CSS_PREFIX = 'range-replacement-';
  var ACTIVE_CLASS = 'is-active';

  /**
   * Represents a point (selected value) for a range input
   *
   * @class Point
   */
  return (function() {

    var Klass = function(args) {
      this._value = this._oldValue = args.value;
      this._width = args.width;
      this._track = args.track;
    };

    /** @lends Point */
    Klass.prototype = {
      constructor: 'Pointer',

      init: function() {
        this._el = this._template();

        return this;
      },

      activate: function() {
        this._el.classList.add(ACTIVE_CLASS);
      },

      deactivate: function() {
        this._el.classList.remove(ACTIVE_CLASS);
      },

      /** @returns pointer html element */
      // TODO: Point value within point template
      _template: function() {
        var pointer = document.createElement('div');
        var style = pointer.style;

        pointer.className = CSS_PREFIX + 'point';
        style.position = 'absolute';

        var pointerWidth = this._width;

        if(!!pointerWidth) {
          style.width = pointerWidth + 'px';
        }

        var valueEl = document.createElement('div');
        valueEl.className = CSS_PREFIX + 'pointer-value';
        valueEl.innerHTML = this._value;

        pointer.appendChild(valueEl);

        this._valueEl = valueEl;
        this._el = pointer;

        return pointer;
      },

      /**
       * gets / sets value
       *
       * @param value - number to replace value
       * @returns value of point
       */
      value: function(value) {
        if(arguments.length) {
          this._oldValue = this._value;
          this._value = parseFloat(value);

          this._valueEl.innerHTML = value || '0';
        }

        return this._value;
      },

      oldValue: function() {
        return this._oldValue;
      },

      /**
       * gets / sets width
       *
       * @param width - number to replace width
       * @returns width of point
       */
      width: function(width) {
        if(arguments.length) {
          this._width = parseFloat(width);
          this._el.style.width = this._width + 'px';
        }

        return this._el.offsetWidth;
      },

      // TODO: this should be on track object
      /** Set left position (in percent) of pointer */
      left: function (percent) {
        if(arguments.length) {
          this._left = this._el.style.left = percent + '%';
        }

        return this._left || '0';
      },

      x: function(){
        return this._el.getBoundingClientRect().left;
      },

      /** append point html to track */
      render: function() {
        this._track.appendChild(this._el);

        return this;
      }
    };

    return Klass;

  })();

});

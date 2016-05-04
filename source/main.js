define(['range'],
  function(Range) {

  'use strict';

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
    init: function(ranges, args, silent) {

      ranges = ranges || 'input[type=range]';

      var replacements = [];

      if(typeof ranges === 'string') {
        // selector string
        ranges = document.querySelectorAll(ranges);
      } else if(typeof ranges.length === 'undefined') {
        // dom node
        return new Range(ranges, args).init(silent);
      }

      for(var i = 0, l = ranges.length; i < l; i++) {
        replacements.push(
          new Range(ranges[i], args).init(silent)
        );
      }

      return replacements;
    }
  }

});

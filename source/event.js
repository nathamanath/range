define([], function() {
  /**
   * Manages custom events
   *
   * @class Event
   * @private
   */
  return {
    /**
     * Lazily evaluates which create method needed
     * @param eventName
     * @param [eventType=HTMLEvents] - type of event
     */
    create: function(eventName, eventType) {
      var method;
      var self = this;

      eventType = eventType || 'HTMLEvents';

      if (document.createEvent) {
        method = function(eventName) {
          var event = document.createEvent(eventType);

          // dont bubble
          event.initEvent(eventName, false, true);

          return event;
        };
      } else {
        // ie < 9
        // BUGFIX: Infinite loop on keypress in ie8
        method = function(eventName, eventType) {
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
    fire: function(el, eventName, eventType, code) {
      var method;
      var self = this;

      if(document.createEvent) {
        method = function(el, eventName, eventType, code) {
          var event = self.create(eventName, eventType);

          if(eventType === 'KeyboardEvent') {
            var get = { get: function() { return code } };
            var defineProperty = Object.defineProperty;

            defineProperty(event, 'which', get);
            defineProperty(event, 'keyCode', get);
          }

          el.dispatchEvent(event);
        };
      } else {
        // ie < 9
        method = function(el, eventName, eventType, code) {
          var onEventName = ['on', eventName].join('');

          if(eventName !== 'input') {
            // Existing ie < 9 event name
            var _event = self.create(eventName);

            _event.keyCode = code;

            el.fireEvent(onEventName, _event);
          } else if(el[onEventName]) {
            // TODO: nicer input event handling for ie8
            el[onEventName]();
          }
        };
      }

      self.fire = method;
      method(el, eventName);
    }
  };
});

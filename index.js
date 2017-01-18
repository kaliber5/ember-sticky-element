/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-sticky-element',

  included: function(app, parentAddon) {
    var target = (parentAddon || app);

    // necessary for nested usage
    if (target.app) {
      target = target.app;
    }

    target.import('vendor/ember-sticky-element.css');
  },

  isDevelopingAddon: function() {
    return true;
  }
};

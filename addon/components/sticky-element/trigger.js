import Ember from 'ember';
import InViewportMixin from 'ember-in-viewport';

const { computed, observer } = Ember;

export default Ember.Component.extend(InViewportMixin, {
  classNameBindings: ['typeClass'],
  classNames: ['sticky-element__trigger'],

  /**
   * @property type
   * @type {string}
   * @default 'top'
   * @public
   */
  type: 'top',

  /**
   * @property offset
   * @type {number}
   * @public
   */
  offset: 0,

  /**
   * @property typeClass
   * @type string
   * @private
   */
  typeClass: computed('type', function() {
    return `sticky-element__trigger--${this.get('type')}`;
  }),

  /**
   * Action when trigger enters viewport
   *
   * @event enter
   * @public
   */
  enter: null,

  /**
   * Action when trigger exits viewport
   *
   * @event exit
   * @public
   */
  exit: null,

  didEnterViewport() {
    this.sendAction('enter');
  },

  didExitViewport() {
    this.sendAction('exit');
  },

  /**
   * @method updateViewportOptions
   * @private
   */
  updateViewportOptions() {
    let viewportTolerance = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    };
    viewportTolerance[this.get('type')] = -this.get('offset');
    Ember.setProperties(this, {
      viewportSpy: true,
      viewportEnabled: true,
      viewportRefreshRate: 1,
      viewportTolerance
    });
  },

  didInsertElement() {
    this.updateViewportOptions();
    this._super(...arguments);
  },

  _onOffsetChange: observer('offset', function() {
    this.updateViewportOptions();
  })
});

import Component from '@ember/component';
import { observer, computed, setProperties } from '@ember/object';
import InViewportMixin from 'ember-in-viewport';

export default Component.extend(InViewportMixin, {
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

  _lastTop: null,

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
   * @param {Boolean} top True if element left the viewport from the top
   * @public
   */
  exit: null,

  isBeforeViewport() {
    let offset = this.get('type') === 'top' ? this.get('offset') : 0;
    return this.get('element').getBoundingClientRect().top - offset < 0;
  },

  didEnterViewport() {
    this.sendAction('enter');
  },

  didExitViewport() {
    this.sendAction('exit', this.isBeforeViewport());
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
    setProperties(this, {
      viewportSpy: true,
      viewportEnabled: true,
      viewportTolerance
    });
  },

  didInsertElement() {
    this.updateViewportOptions();
    this._super(...arguments);
  },

  _onOffsetChange: observer('offset', function() {
    this.updateViewportOptions();
  }),

  _bindScrollDirectionListener() {},
  _unbindScrollDirectionListener() {},

  /**
   * Override ember-in-viewport method to trigger event also when trigger has moved from below viewport to on top
   * of viewport without triggering didEnterViewport because of too fast scroll movement
   *
   * @method _triggerDidAccessViewport
   * @param hasEnteredViewport
   * @private
   */
  _triggerDidAccessViewport(hasEnteredViewport = false) {
    let viewportEntered = this.get('viewportEntered');
    let didEnter = !viewportEntered && hasEnteredViewport;
    let didLeave = viewportEntered && !hasEnteredViewport;

    let lastTop = this._lastTop;
    this._lastTop = this.isBeforeViewport();

    if (!didEnter && !didLeave) {
      if (lastTop !== this._lastTop) {
        this._super(true);
        this._super(false);
      }
    } else {
      this._super(hasEnteredViewport);
    }
  }

});

import Ember from 'ember';
import { or, notEmpty } from '@ember/object/computed';
import { htmlSafe } from '@ember/string';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { later, cancel, debounce } from '@ember/runloop';
import { guidFor } from '@ember/object/internals';
import polyfillLayout from '../templates/components/polyfill-sticky-element';
import nativeLayout from '../templates/components/sticky-element';

const { testing } = Ember;

function elementPosition(element, offseTop, offsetBottom) {
  let top = element.getBoundingClientRect().top;
  if (top - offseTop < 0) {
    return 'top';
  }
  if (top + element.offsetHeight + offsetBottom <= window.innerHeight) {
    return 'in';
  }
  return 'bottom';
}

export default Component.extend({
  layout: computed('hasNativeSupport', function() {
    return this.get('hasNativeSupport') ? nativeLayout : polyfillLayout;
  }),
  tagName: '',

  /**
   * The offset from the top of the viewport when to start sticking to the top
   *
   * @property top
   * @type {number}
   * @default 0
   * @public
   */
  top: 0,

  /**
   * The offset from the parents bottom edge when to start sticking to the bottom of the parent
   * When `null` (default) sticking to the bottom is disabled. Use 0 or any other appropriate offset to enable it.
   *
   * @property bottom
   * @type {boolean|null}
   * @public
   */
  bottom: null,

  /**
   * Set to false to disable sticky behavior
   *
   * @property enabled
   * @type {boolean}
   * @default true
   * @public
   */
  enabled: true,

  /**
   * The class name set on the element container.
   *
   * @property containerClassName
   * @type {string|null}
   * @default 'sticky-element'
   * @public
   */
  containerClassName: 'sticky-element',

  /**
   * The class name set on the element container when it is sticked.
   *
   * @property containerStickyClassName
   * @type {string|null}
   * @default 'sticky-element--sticky'
   * @public
   */
  containerStickyClassName: 'sticky-element--sticky',

  /**
   * The class name set on the element container when it is sticked to top.
   *
   * @property containerStickyTopClassName
   * @type {string|null}
   * @default 'sticky-element--sticky-top'
   * @public
   */
  containerStickyTopClassName: 'sticky-element--sticky-top',

  /**
   * The class name set on the element container when it is sticked to bottom.
   *
   * @property containerStickyBottomClassName
   * @type {string|null}
   * @default 'sticky-element--sticky-bottom'
   * @public
   */
  containerStickyBottomClassName: 'sticky-element--sticky-bottom',

  /**
   * @property isSticky
   * @type {boolean}
   * @readOnly
   * @private
   */
  isSticky: or('isStickyTop', 'isStickyBottom').readOnly(),

  /**
   * @property isStickyTop
   * @type {boolean}
   * @readOnly
   * @private
   */
  isStickyTop: computed('enabled', 'parentTop', 'parentBottom', 'isStickyBottom', function() {
    return this.get('enabled') && this.get('parentTop') === 'top' && !this.get('isStickyBottom');
  }).readOnly(),

  /**
   * @property isStickyBottom
   * @type {boolean}
   * @readOnly
   * @private
   */
  isStickyBottom: computed('enabled', 'parentBottom', 'stickToBottom', function() {
    return this.get('enabled') && this.get('parentBottom') !== 'bottom' && this.get('stickToBottom');
  }).readOnly(),

  /**
   * @property parentTop
   * @type {string}
   * @private
   */
  parentTop: 'bottom',

  /**
   * @property parentBottom
   * @type {string}
   * @private
   */
  parentBottom: 'bottom',

  /**
   * @property ownHeight
   * @type {number}
   * @private
   */
  ownHeight: 0,

  /**
   * @property ownWidth
   * @type {number}
   * @private
   */
  ownWidth: 0,

  /**
   * @property wrapper
   * @type {Node|null}
   * @private
   */
  wrapper: null,

  /**
   * @property stickToBottom
   * @type {boolean}
   * @readOnly
   * @private
   */
  stickToBottom: notEmpty('bottom').readOnly(),

  /**
   * @property windowHeight
   * @type {number}
   * @private
   */
  windowHeight: 0,

  /**
   * @property topTriggerElement
   * @private
   */
  topTriggerElement: null,

  /**
   * @property bottomTriggerElement
   * @private
   */
  bottomTriggerElement: null,

  /**
   * Feature detection stolen from modernizr
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/css/positionsticky.js
   *
   * @property hasNativeSupport
   * @private
   */
  hasNativeSupport: computed(function() {
    let prop = 'position:';
    let value = 'sticky';
    let el = document.createElement('a');
    let mStyle = el.style;
    let prefixes = ["", "-webkit-", "-moz-", "-o-", "-ms-"];

    mStyle.cssText = prop + prefixes.join(value + ';' + prop).slice(0, -prop.length);

    return mStyle.position.indexOf(value) !== -1;
  }),

  /**
   * @property offsetBottom
   * @type {number}
   * @private
   */
  offsetBottom: computed('top', 'ownHeight', 'bottom', 'windowHeight', function() {
    let { top, ownHeight, bottom, windowHeight } = this.getProperties('top', 'ownHeight', 'bottom', 'windowHeight');
    return (windowHeight - top - ownHeight - bottom);
  }),

  /**
   * Dynamic style for the sticky element
   * if the component is used with native sticky support
   *
   * @property nativeStyle
   * @type {string}
   * @private
   */
  nativeStyle: computed('enabled', 'hasNativeSupport', 'top', 'bottom', 'stickToBottom', function() {
    if (this.get('enabled') && this.get('hasNativeSupport')) {
      let style = `position: sticky; top: ${this.get('top')}px;`;
      if (this.get('stickToBottom')) {
        style += `bottom: ${this.get('bottom')}px`;
      }
      return htmlSafe(style);
    } else {
      return '';
    }
  }),

  /**
   * Id for the wrapper element
   * if the component is used with polyfill mode
   *
   * @property wrapperId
   * @type {string}
   * @private
   */
  wrapperId: computed(function() {
    return guidFor(this);
  }),

  /**
   * Dynamic style for the wrapper element
   * if the component is used with polyfill mode
   *
   * @property wrapperStyle
   * @type {string}
   * @private
   */
  wrapperStyle: computed('isSticky', 'ownHeight', 'ownWidth', function() {
    let height = this.get('ownHeight');
    if (height > 0 && this.get('isSticky')) {
      return htmlSafe(`height: ${height}px;`);
    }
  }),

  /**
   * Dynamic style for the sticky container (`position: fixed`)
   *
   * @property containerStyle
   * @type {string}
   * @private
   */
  containerStyle: computed('isStickyTop', 'isStickyBottom', 'top', 'bottom', 'ownWidth', function() {
    if (this.get('isStickyBottom')) {
      let style = `position: absolute; bottom: ${this.get('bottom')}px; width: ${this.get('ownWidth')}px`;
      return htmlSafe(style);
    }
    if (this.get('isStickyTop')) {
      let style = `position: fixed; top: ${this.get('top')}px; width: ${this.get('ownWidth')}px`;
      return htmlSafe(style);
    }
  }),

  /**
   * Add listener to update sticky element width on resize event
   * @method initResizeEventListener
   * @private
   */
  initResizeEventListener() {
    this._resizeListener = () => this.debouncedUpdateDimension();
    window.addEventListener('resize', this._resizeListener, false);
  },

  /**
   * @method removeResizeEventListener
   * @private
   */
  removeResizeEventListener() {
    window.removeEventListener('resize', this._resizeListener, false);
  },

  _pollTask() {
    this.updatePosition();
    this.initPollTask();
  },

  initPollTask() {
    if (!testing) {
      this._pollTimer = later(this, this._pollTask, 500);
    }
  },

  removePollTask() {
    if (this._pollTimer) {
      cancel(this._pollTimer);
    }
  },

  /**
   * @method debouncedUpdateDimension
   * @private
   */
  debouncedUpdateDimension() {
    debounce(this, this.updateDimension, 30);
  },

  /**
   * @method updateDimension
   * @private
   */
  updateDimension() {
    if(this.get('isDestroyed') || this.get('isDestroying')) {
      return false;
    }
    this.set('windowHeight', window.innerHeight);
    this.set('ownHeight', this.get('wrapper').offsetHeight);
    this.set('ownWidth', this.get('wrapper').offsetWidth);
  },

  updatePosition() {
    let { topTriggerElement, bottomTriggerElement } = this;

    if (topTriggerElement) {
      this.set('parentTop', elementPosition(topTriggerElement, this.get('top'), 0));
    }
    if (bottomTriggerElement) {
      this.set('parentBottom', elementPosition(bottomTriggerElement, 0, this.get('offsetBottom')));
    }
  },

  didInsertElement() {
    this._super(...arguments);
    let wrapperId = this.get('wrapperId');
    this.set('wrapper', document.getElementById(wrapperId));
    this.updateDimension();
    // scheduleOnce('afterRender', this, this.updateDimension);
    this.initResizeEventListener();
    this.initPollTask();
  },

  willDestroyElement() {
    this.removeResizeEventListener();
    this.removePollTask();
  },

  actions: {
    parentTopEntered() {
      // console.log('parentTopEntered');
      this.set('parentTop', 'in');
    },
    parentTopExited() {
      // make sure we captured the right dimensions before getting sticky!
      // console.log('parentTopExited');
      this.updateDimension();
      this.updatePosition();
    },
    parentBottomEntered() {
      // console.log('parentBottomEntered');
      this.set('parentBottom', 'in');
    },
    parentBottomExited() {
      // console.log('parentBottomExited');
      this.updatePosition();
    },
    registerTopTrigger(element) {
      this.topTriggerElement = element;
      this.updatePosition();
    },
    registerBottomTrigger(element) {
      this.bottomTriggerElement = element;
      this.updatePosition();
    }
  }
});

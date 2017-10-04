import $ from 'jquery';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sticky-element', 'Integration | Component | sticky element', {
  integration: true
});

function scrollTo(pos, animate = false) {
  let top;
  let windowHeight = $('#ember-testing-container').height();
  let innerHeight = $('#ember-testing-container').get(0).scrollHeight;

  switch (pos) {
    case 'top':
      top = 0;
      break;
    case 'down':
      top = windowHeight / 10;
      break;
    case 'end of parent':
      top = $('#ember-testing-container .col').height() - windowHeight + 10;
      break;
    case 'into view':
      top = $('#ember-testing-container .col').get(0).offsetTop - windowHeight + 10;
      break;
    case 'out of view':
      top = $('#ember-testing-container .col').get(0).offsetTop + 10;
      break;
    case 'bottom':
      top = innerHeight - windowHeight;
      break;
    default:
      throw new Error(`Unsupported scroll position: ${pos}`);
  }

  return new RSVP.Promise((resolve) => {
    if (animate) {
      $('#ember-testing-container')
        .stop()
        .animate({ scrollTop: top }, 1000, () => {
          resolve();
        });
    } else {
      $('#ember-testing-container').scrollTop(top);
      resolve();
    }
  });
}

const testCases = [
  {
    size: 'small',
    scrollPosition: 'top',
    offView: false,
    stickToBottom: false,
    sticky: false
  },
  {
    size: 'small',
    scrollPosition: 'down',
    offView: false,
    stickToBottom: false,
    sticky: 'top'
  },
  {
    size: 'small',
    scrollPosition: 'end of parent',
    offView: false,
    stickToBottom: false,
    sticky: 'top'
  },
  {
    size: 'small',
    scrollPosition: 'bottom',
    offView: false,
    stickToBottom: false,
    sticky: 'top'
  },

  {
    size: 'large',
    scrollPosition: 'top',
    offView: false,
    stickToBottom: false,
    sticky: false
  },
  {
    size: 'large',
    scrollPosition: 'down',
    offView: false,
    stickToBottom: false,
    sticky: 'top'
  },
  {
    size: 'large',
    scrollPosition: 'end of parent',
    offView: false,
    stickToBottom: false,
    sticky: 'top'
  },
  {
    size: 'large',
    scrollPosition: 'bottom',
    offView: false,
    stickToBottom: false,
    sticky: 'top'
  },

  {
    size: 'small',
    scrollPosition: 'top',
    offView: false,
    stickToBottom: true,
    sticky: false
  },
  {
    size: 'small',
    scrollPosition: 'down',
    offView: false,
    stickToBottom: true,
    sticky: 'top'
  },
  {
    size: 'small',
    scrollPosition: 'end of parent',
    offView: false,
    stickToBottom: true,
    sticky: 'top'
  },
  {
    size: 'small',
    scrollPosition: 'bottom',
    offView: false,
    stickToBottom: true,
    sticky: 'bottom'
  },

  {
    size: 'large',
    scrollPosition: 'top',
    offView: false,
    stickToBottom: true,
    sticky: false
  },
  {
    size: 'large',
    scrollPosition: 'down',
    offView: false,
    stickToBottom: true,
    sticky: 'top'
  },
  {
    size: 'large',
    scrollPosition: 'end of parent',
    offView: false,
    stickToBottom: true,
    sticky: 'bottom'
  },
  {
    size: 'large',
    scrollPosition: 'bottom',
    offView: false,
    stickToBottom: true,
    sticky: 'bottom'
  },

  {
    size: 'small',
    scrollPosition: 'top',
    offView: true,
    stickToBottom: false,
    sticky: false
  },
  {
    size: 'small',
    scrollPosition: 'into view',
    offView: true,
    stickToBottom: false,
    sticky: false
  },
  {
    size: 'small',
    scrollPosition: 'out of view',
    offView: true,
    stickToBottom: false,
    sticky: 'top'
  },
  {
    size: 'small',
    scrollPosition: 'bottom',
    offView: true,
    stickToBottom: false,
    sticky: 'top'
  },

  {
    size: 'large',
    scrollPosition: 'top',
    offView: true,
    stickToBottom: false,
    sticky: false
  },
  {
    size: 'large',
    scrollPosition: 'into view',
    offView: true,
    stickToBottom: false,
    sticky: false
  },
  {
    size: 'large',
    scrollPosition: 'out of view',
    offView: true,
    stickToBottom: false,
    sticky: 'top'
  },
  {
    size: 'large',
    scrollPosition: 'bottom',
    offView: true,
    stickToBottom: false,
    sticky: 'top'
  },

  {
    size: 'small',
    scrollPosition: 'top',
    offView: true,
    stickToBottom: true,
    sticky: false
  },
  {
    size: 'small',
    scrollPosition: 'into view',
    offView: true,
    stickToBottom: true,
    sticky: false
  },
  {
    size: 'small',
    scrollPosition: 'out of view',
    offView: true,
    stickToBottom: true,
    sticky: 'top'
  },
  {
    size: 'small',
    scrollPosition: 'bottom',
    offView: true,
    stickToBottom: true,
    sticky: 'top'
  },

  {
    size: 'large',
    scrollPosition: 'top',
    offView: true,
    stickToBottom: true,
    sticky: false
  },
  {
    size: 'large',
    scrollPosition: 'into view',
    offView: true,
    stickToBottom: true,
    sticky: false
  },
  {
    size: 'large',
    scrollPosition: 'out of view',
    offView: true,
    stickToBottom: true,
    sticky: 'top'
  },
  {
    size: 'large',
    scrollPosition: 'bottom',
    offView: true,
    stickToBottom: true,
    sticky: 'bottom'
  }

];

testCases.forEach((testCase) => {
  [true, false].forEach((scrollAnimate) => {
    test(`Scrolling | Size: ${testCase.size}, offView: ${testCase.offView}, stick to bottom: ${testCase.stickToBottom === false ? 'false' : 'true'}, scroll position: ${testCase.scrollPosition}, slow scroll: ${scrollAnimate}`, function(assert) {
      this.setProperties(testCase);
      this.set('bottom', testCase.stickToBottom ? 0 : null);
      this.render(hbs`
        <div class="row">
          <div class="col {{size}} {{if offView "off"}}">
            {{#sticky-element class="sticky" bottom=bottom as |sticky|}}
              <p id="debug">
                {{sticky-debug sticky}}
              </p>
            {{/sticky-element}}
          </div>
        </div>
      `);

      let debug;
      switch (testCase.sticky) {
        case 'top':
          debug = 'Stick to top';
          break;
        case 'bottom':
          debug = 'Stick to bottom';
          break;
        default:
          debug = 'Not sticky';
      }

      return scrollTo(testCase.scrollPosition, scrollAnimate)
        .then(() => {
          return new RSVP.Promise((resolve) => {
            setTimeout(() => {
              assert.equal(this.$('#debug').text().trim(), debug, debug);
              resolve();
            }, 20);
          });
        });
    });
  });

  test(`Late insert | Size: ${testCase.size}, offView: ${testCase.offView}, stick to bottom: ${testCase.stickToBottom === false ? 'false' : 'true'}, scroll position: ${testCase.scrollPosition}`, function(assert) {
    this.setProperties(testCase);
    this.set('bottom', testCase.stickToBottom ? 0 : null);
    this.set('visible', false);
    this.render(hbs`
        <div class="row">
          <div class="col {{size}} {{if offView "off"}}">
            {{#if visible}}
              {{#sticky-element class="sticky" bottom=bottom as |sticky|}}
                <p id="debug">
                  {{sticky-debug sticky}}
                </p>
              {{/sticky-element}}
            {{/if}}
          </div>
        </div>
      `);

    let debug;
    switch (testCase.sticky) {
      case 'top':
        debug = 'Stick to top';
        break;
      case 'bottom':
        debug = 'Stick to bottom';
        break;
      default:
        debug = 'Not sticky';
    }

    return scrollTo(testCase.scrollPosition)
      .then(() => {
        this.set('visible', true);
        return new RSVP.Promise((resolve) => {
          setTimeout(() => {
            assert.equal(this.$('#debug').text().trim(), debug, debug);
            resolve();
          }, 50);
        });
      });
  });

});
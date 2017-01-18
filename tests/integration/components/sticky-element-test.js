import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('sticky-element', 'Integration | Component | sticky element', {
  integration: true
});

const {
  $
} = Ember;

function scrollTo(pos) {
  let top;
  let windowHeight = $('#ember-testing-container').height();

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
      top = 10000;
      break;
    default:
      throw new Error(`Unsupported scroll position: ${pos}`);
  }

  $('#ember-testing-container').scrollTop(top).scroll();
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
  test(`Size: ${testCase.size}, offView: ${testCase.offView}, stick to bottom: ${testCase.stickToBottom === false ? 'false' : 'true'}, scroll position: ${testCase.scrollPosition}`, function(assert) {
    this.setProperties(testCase);
    this.set('bottom', testCase.stickToBottom ? 0 : false);
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

    scrollTo(testCase.scrollPosition);

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

    let done = assert.async();
    setTimeout(() => {
      assert.equal(this.$('#debug').text().trim(), debug, debug);
      done();
    }, 110);
  });
});



import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { registerWaiter } from 'ember-raf-test-waiter';
import _scrollTo from '../../helpers/scroll-to';

const testProps = {
  size: ['small', 'large'],
  scrollPosition: ['top', 'down', 'end of parent', 'bottom', 'into view', 'out of view'],
  offView: [false, true],
  stickToBottom: [false, true]
};

const testCases = [];

testProps.size.forEach(size => {
  testProps.scrollPosition.forEach(scrollPosition => {
    testProps.offView.forEach(offView => {
      testProps.stickToBottom.forEach(stickToBottom => {
        let sticky = false;

        if (
          scrollPosition === 'down' && offView === false
          || scrollPosition === 'end of parent'
          || scrollPosition === 'out of view'
          || scrollPosition === 'bottom' && stickToBottom === false
          || scrollPosition === 'bottom' && offView === true
        ) {
          sticky = 'top';
        }

        if (
          scrollPosition === 'bottom' && stickToBottom === true && offView === false
          || scrollPosition === 'end of parent' && stickToBottom === true && size === 'large'
          || scrollPosition === 'bottom' && stickToBottom === true && size === 'large' && offView === true
        ) {
          sticky = 'bottom';
        }

        testCases.push({
          size,
          scrollPosition,
          offView,
          stickToBottom,
          sticky
        })
      })
    })
  })
});

module('Integration | Component | sticky element', function(hooks) {
  setupRenderingTest(hooks);

  hooks.before(function() {
    registerWaiter();
  });

  function scrollTo(pos, animate = true) {
    let top;
    let windowHeight = document.querySelector('#ember-testing-container').offsetHeight;
    let innerHeight = document.querySelector('#ember-testing-container').scrollHeight;

    switch (pos) {
      case 'top':
        top = 0;
        break;
      case 'down':
        top = windowHeight / 10;
        break;
      case 'end of parent':
        top = document.querySelector('#ember-testing-container .col').offsetTop + document.querySelector('#ember-testing-container .col').offsetHeight - windowHeight + 10;
        break;
      case 'into view':
        top = Math.max(document.querySelector('#ember-testing-container .col').offsetTop - windowHeight + 10, 0);
        break;
      case 'out of view':
        top = document.querySelector('#ember-testing-container .col').offsetTop + 10;
        break;
      case 'bottom':
        top = innerHeight - windowHeight + 1;
        break;
      default:
        throw new Error(`Unsupported scroll position: ${pos}`);
    }

    if (animate) {
      return _scrollTo(
        document.querySelector('#ember-testing-container'),
        top,
        100)
        .then(settled);
    } else {
      document.querySelector('#ember-testing-container').scrollTop = top;
      return settled();
    }
  }

  function output(sticky) {
    switch (sticky) {
      case 'top':
        return 'Stick to top';
      case 'bottom':
        return 'Stick to bottom';
      default:
        return 'Not sticky';
    }
  }

  testCases.forEach((testCase) => {
    test(`Scrolling | Size: ${testCase.size}, offView: ${testCase.offView}, stick to bottom: ${testCase.stickToBottom === false ? 'false' : 'true'}, scroll position: ${testCase.scrollPosition}`, async function(assert) {
      this.setProperties(testCase);
      this.set('bottom', testCase.stickToBottom ? 0 : null);
      await render(hbs`
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

      let debug = output(testCase.sticky);

      await scrollTo(testCase.scrollPosition);
      // await this.pauseTest();
      assert.dom('#debug').hasText(debug, debug);
    });

    test(`Late insert | Size: ${testCase.size}, offView: ${testCase.offView}, stick to bottom: ${testCase.stickToBottom === false ? 'false' : 'true'}, scroll position: ${testCase.scrollPosition}`, async function(assert) {
      this.setProperties(testCase);
      this.set('bottom', testCase.stickToBottom ? 0 : null);
      this.set('visible', false);
      await render(hbs`
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

      let debug = output(testCase.sticky);

      await scrollTo(testCase.scrollPosition);
      this.set('visible', true);
      await settled();
      assert.dom('#debug').hasText(debug, debug);
    });
  });

  test('can be disabled', async function(assert) {
    this.setProperties({
      size: 'small',
      scrollPosition: 'down',
      offView: false,
      stickToBottom: false,
      sticky: 'top'
    });
    await render(hbs`
      <div class="row">
        <div class="col {{size}} {{if offView "off"}}">
          {{#sticky-element class="sticky" enabled=false as |sticky|}}
            <p id="debug">
              {{sticky-debug sticky}}
            </p>
          {{/sticky-element}}
        </div>
      </div>
    `);

    let debug = output(false);

    await scrollTo('down', true);
    assert.dom('#debug').hasText(debug, debug);
    assert.dom('.sticky').doesNotHaveAttribute('style');
  });

  test('Is resizable', async function(assert) {
    let stickyElementWidth;
    this.setProperties({
      size: 'small',
      scrollPosition: 'down',
      offView: false,
      stickToBottom: false,
      sticky: 'top'
    });
    this.set('containerWidth', 'width:500px');
    await render(hbs`
      <div class="row">
        <div class="col {{size}} {{if offView "off"}}" style={{{containerWidth}}}>
          {{#sticky-element class="sticky" bottom=bottom as |sticky|}}
            <p id="debug">
              {{sticky-debug sticky}}
            </p>
          {{/sticky-element}}
        </div>
      </div>
    `);
    let debug = output('top');
    await scrollTo('down', true);
    assert.dom('#debug').hasText(debug, debug);
    stickyElementWidth = document.querySelector('.sticky-element').clientWidth;
    assert.equal(stickyElementWidth, 500);
    this.set('containerWidth', 'width:300px');
    await settled();
    window.dispatchEvent(new Event('resize'));
    await settled();
    stickyElementWidth = document.querySelector('.sticky-element').clientWidth;
    assert.equal(stickyElementWidth, 300);
    assert.dom('#debug').hasText(debug, debug);
  });
});

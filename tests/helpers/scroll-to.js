import RSVP from 'rsvp';

export default function scrollTo(element, to, duration) {
  return new RSVP.Promise(function(resolve) {
    _scrollTo(element, Math.round(to), duration, resolve);
  });
}

const step = 1;

function _scrollTo(element, to, duration, cb) {
  if (duration <= 0) return;
  let difference = to - window.scrollY;
  let perTick = difference / duration * step;
  let limit = difference < 0 ? Math.max : Math.min;

  setTimeout(function() {
    window.scroll(0, limit(window.scrollY + perTick, to));
    if (window.scrollY === to) {
      cb();
      return;
    }
    _scrollTo(element, to, duration - step, cb);
  }, step);
}
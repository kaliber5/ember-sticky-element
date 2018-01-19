import RSVP from 'rsvp';

export default function scrollTo(element, to, duration) {
  return new RSVP.Promise(function(resolve) {
    _scrollTo(element, Math.round(to), duration, resolve);
  });
}

function _scrollTo(element, to, duration, cb) {
  if (duration <= 0) return;
  let difference = to - element.scrollTop;
  let perTick = difference / duration * 10;
  let limit = difference < 0 ? Math.min : Math.max;

  setTimeout(function() {
    element.scrollTop = limit(element.scrollTop + perTick, to);
    if (element.scrollTop === to) {
      cb();
      return;
    }
    _scrollTo(element, to, duration - 10, cb);
  }, 10);
}
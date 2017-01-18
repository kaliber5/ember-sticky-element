import Ember from 'ember';

export function stickyDebug(params/*, hash*/) {
  let stickyness = params[0];

  switch (true) {
    case stickyness.isStickyTop:
      return 'Stick to top';
    case stickyness.isStickyBottom:
      return 'Stick to bottom';
    default:
      return 'Not sticky';
  }
}

export default Ember.Helper.helper(stickyDebug);

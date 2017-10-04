import { helper } from '@ember/component/helper';

export function stickyDebug(params) {
  let [stickyness] = params;

  switch (true) {
    case stickyness.isStickyTop:
      return 'Stick to top';
    case stickyness.isStickyBottom:
      return 'Stick to bottom';
    default:
      return 'Not sticky';
  }
}

export default helper(stickyDebug);

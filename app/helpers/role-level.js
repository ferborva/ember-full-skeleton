import Ember from 'ember';

export function roleLevel(params/*, hash*/) {
  var level = params[0];
  if (level == 3) {
    return 'Admin';
  } else if (level == 2) {
    return 'Moderator';
  } else if (level == 1) {
    return 'Member';
  } else if (level == 0){
    return 'User';
  } else if (level === null){
    return 'Undefined';
  }
}

export default Ember.Helper.helper(roleLevel);

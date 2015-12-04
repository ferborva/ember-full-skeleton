import Ember from 'ember';

export default Ember.Service.extend({

  // Materialize.toast(message, displayLength, className, completeCallback);
  addToast: function (a,b,c,d) {
    a = a ? a : '';
    b = b ? b : 2000;
    c = c ? c : '';
    d = d ? d : null;

    Materialize.toast(a,b,c,d);
  }

});

import Ember from 'ember';

export default Ember.Service.extend({

  addToast: function (a,b,c,d) {
    a = a ? a : '';
    b = b ? b : 2000;
    c = c ? c : '';
    d = d ? d : null;

    Materialize.toast(a,b,c,d);
  }

});

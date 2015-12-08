import Ember from 'ember';

export default Ember.Controller.extend({

  Data: Ember.inject.service('datapoint'),
  onlineUsers: Ember.computed.alias('Data.onlineUsers'),

  init: function(){
    this._super.apply(this, arguments);
  }
});

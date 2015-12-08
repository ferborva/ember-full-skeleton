import Ember from 'ember';

export default Ember.Controller.extend({
  onlineUsers: '',

  Data: Ember.inject.service('datapoint'),

  init: function(){
    this._super.apply(this, arguments);

    this.Data.openSocket('presentUsersRef', [], 'onlineUsers').then(
      function (data) {
        this.set('onlineUsers', data);
      }.bind(this),
      function (errorObj) {
        console.log(errorObj);
      }.bind(this)
    );
  }
});

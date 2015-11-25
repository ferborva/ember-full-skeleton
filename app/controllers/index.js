import Ember from 'ember';

export default Ember.Controller.extend({
  onlineUsers: '',

  Data: Ember.inject.service('datapoint'),

  init: function(){
    this._super.apply(this, arguments);
    this.Data.get('presentUsersRef').on('value', function(snapshot){
        if (snapshot.val() !== null) {
          var arrData = this.Data.objectToArray(snapshot.val());
          this.set('onlineUsers', arrData);
        } else {
          this.set('onlineUsers', '');
        }
    }.bind(this));
  }
});

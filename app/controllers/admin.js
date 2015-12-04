import Ember from 'ember';

export default Ember.Controller.extend({
  onlineUsers: '',
  existingUsers: '',

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

console.log('here');
    this.Data.get('baseRef').child('users').once('value', function(snapshot){
        if (snapshot.val() !== null) {
          var arrData = this.Data.objectToArray(snapshot.val());
          this.set('existingUsers', arrData);
        } else {
          this.set('existingUsers', '');
        }
    }.bind(this));

  }
});

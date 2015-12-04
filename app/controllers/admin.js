import Ember from 'ember';

export default Ember.Controller.extend({
  onlineUsers: '',
  existingUsers: '',
  tempUser: '',

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

    this.Data.get('baseRef').child('users').once('value', function(snapshot){
        if (snapshot.val() !== null) {
          var arrData = this.Data.objectToArray(snapshot.val());
          for (var i = 0; i < arrData.length; i++) {
            arrData[i].editting = false;
          }
          this.set('existingUsers', arrData);
        } else {
          this.set('existingUsers', '');
        }
    }.bind(this));

  },

  actions: {
    updateDisplayName: function(user){
      this.Data.get('baseRef').child('users').child(user.key).set(user);
    },

    toggleEdit: function(user){
      this.set('tempUser', user);
      console.log(user);
      if(!user.editting){
        this.set('tempUser.editting', true);
      }else{
        this.set('tempUser.editting', false);
      }
    }
  }
});

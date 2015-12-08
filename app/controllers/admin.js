import Ember from 'ember';

export default Ember.Controller.extend({
  onlineUsers: Ember.computed.alias('Data.onlineUsers'),
  existingUsers: '',
  tempUser: '',

  init: function(){
    this._super.apply(this, arguments);

    this.Data.get('baseRef').child('users').once('value', function(snapshot){
        if (snapshot.val() !== null) {
          var arrData = this.Data.objectToArray(snapshot.val());
          for (var i = 0; i < arrData.length; i++) {
            arrData[i].editting = false;
            arrData[i].roleLevel = null;
          }
          this.set('existingUsers', arrData);
        } else {
          this.set('existingUsers', '');
        }
    }.bind(this));

  },

  includeRoles: Ember.observer('existingUsers', function() {
    this.Data.get('baseRef').child('roles').once('value', function(snapshot){
        if (snapshot.val() !== null) {
          var users = this.get('existingUsers');
          var arrData = this.Data.objectToArray(snapshot.val());
          for (var i = 0; i < arrData.length; i++) {
            for (var j = 0; j < users.length; j++) {
              if(users[j].key === arrData[i].key){
                this.set('tempUser', users[j]);
                this.set('tempUser.roleLevel',  arrData[i].level);
              }
            }
          }
        }
    }.bind(this), function(){
      console.log('no data access');
    }.bind(this));
  }),

  actions: {
    updateDisplayName: function(user){
      this.Data.get('baseRef').child('users').child(user.key).child('profile').set(user.profile);
      this.Data.get('baseRef').child('roles').child(user.key).child('level').set(Number(user.roleLevel));
      this.set('tempUser', user);
      this.set('tempUser.editting', false);
      this.Toast.addToast(this.get('i18n').t('label.dataSaved'), 2000);
    },

    toggleEdit: function(user){
      this.set('tempUser', user);
      if(!user.editting){
        this.set('tempUser.editting', true);
      }else{
        this.set('tempUser.editting', false);
      }
    }
  }
});

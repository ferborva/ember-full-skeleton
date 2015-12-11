import Ember from 'ember';

export default Ember.Controller.extend({

  Data: Ember.inject.service('datapoint'),
  onlineUsers: Ember.computed.alias('this.Data.onlineUsers'),
  existingUsers: Ember.computed.alias('this.Data.existingUsers'),
  tempUser: '',

  actions: {
    updateDisplayName: function(user){
      this.Data.setData(null, ['users', user.key, 'profile'], null, user.profile);
      this.Data.setData(null, ['roles', user.key, 'level'], null, user.roleLevel);
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

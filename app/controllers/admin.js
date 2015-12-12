import Ember from 'ember';

export default Ember.Controller.extend({

  Data: Ember.inject.service('datapoint'),
  onlineUsers: [],
  existingUsers: Ember.computed.alias('this.Data.existingUsers'),
  tempUser: '',

  setup: function () {


    this.Data.get('baseRef').child('presence').on('child_added', function(newData, previousDataId){
      //Add/process new data

      var arrData = [];
      var values = newData.val();
      var keys = Object.keys(values);
      if(typeof keys[0] == 'object'){
        arrData = this.Data.objectToArray(values);
      }else{
        values.key = newData.key();
        arrData.push(values);
      }
      if(previousDataId === null){
        this.set('onlineUsers', []);
      }
      for (var i = 0; i < arrData.length; i++) {
        if(this.get('onlineUsers')){
          this.get('onlineUsers').addObject(arrData[i]);
        }else{
          this.set('onlineUsers',arrData[i]);
        }
      }

      this.Toast.addToast('New data recevied', 2000);
    }.bind(this), function(error){
      //Display error
    }.bind(this));



    this.Data.get('baseRef').child('presence').on('child_removed', function(deletedData){
      //Remove/process old data

      var arrData = [];
      var values = deletedData.val();
      var keys = Object.keys(values);
      if(typeof keys[0] == 'object'){
        arrData = this.Data.objectToArray(values);
      }else{
        values.key = deletedData.key();
        arrData.addObject(values);
      }
      var tempusers = this.get('onlineUsers');
      for (var j = 0; j < arrData.length; j++) {
        for (var i = 0; i < tempusers.length; i++) {
          if (tempusers[i].key === arrData[j].key) {
            tempusers.removeAt(i);
          }
        }
      }
      this.Toast.addToast('Data deleted recevied', 2000);
    }.bind(this), function(error){
      //Display error
    }.bind(this));
  },

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

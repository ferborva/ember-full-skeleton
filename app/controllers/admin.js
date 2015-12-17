import Ember from 'ember';

export default Ember.Controller.extend({

  onlineUsers: [],
  existingUsers: '',
  tempUser: '',
  modalAnswer: '',

  setup: function () {

    var loadedUsers = this.Data.get('existingUsers');
    this.set('existingUsers', loadedUsers);

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

  observeModal: Ember.observer('modalAnswer', function(){
    var modalData = this.get('modalAnswer');
    if(modalData && modalData.action){
      if(modalData.action === 'deleteRecord' && modalData.message === 'yes' && modalData.data.key){
        this.Data.deleteData(null, ['users', modalData.data.key]).then(function(data){
          // Server data deleted. Now remove local copy
          console.log(data);
          var tempusers = this.get('existingUsers');
          for (var i = 0; i < tempusers.length; i++) {
            if (tempusers[i].key === modalData.data.key) {
              tempusers.removeAt(i);
            }
          }
          this.send('toggleEdit', modalData.data);
        }.bind(this), function(err){
          console.log(err);
        })
      }else{
        this.send('toggleEdit', modalData.data);
      }
    }
  }),

  actions: {
    updateDisplayName: function(user){
      this.Data.setData(null, ['users', user.key, 'profile'], user.profile);
      this.Data.setData(null, ['roles', user.key, 'level'], user.roleLevel);
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
      // Setup modal triggers
      setTimeout(function(){
        $('.modal-trigger').leanModal();
      }, 200);

    },

    setDeleteAction: function(user){
      this.Data.set('modalAction', 'deleteRecord');
      this.Data.set('modalData', user);
      return false;
    }
  }
});

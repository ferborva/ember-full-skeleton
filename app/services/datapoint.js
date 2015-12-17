import Ember from 'ember';

export default Ember.Service.extend({

  session: Ember.inject.service(),
  i18n: Ember.inject.service(),
  routing: Ember.inject.service('-routing'),


  // DATA PROPERTIES ARE DEFINED HERE AS EMPTY STRINGS: ''

  userData: {
    profile: '',
    securityLevel: '',
    config: ''
  },

  appData: {
    // DEFINE APP DATA HERE FOLLOWING THE SAME STRUCTURE FOUND IN USER DATA.

  },


  // Datapoint variables
  firebase: 'https://cfmcom.firebaseio.com',
  baseRef: '',
  userRef: '',
  publicRef: '',
  communityRef: '',
  presenceRef: '',
  presentUsersRef: '',
  onlineRef: '',
  onlineUsers: '',
  userId: null,
  entryTransition: '',


  initialize: function(transition){
    var userUrl = '',
        self = this;

      // Set baseRef
    this.set('baseRef', new Firebase(this.get('firebase')));
    this.set('communityRef', new Firebase(this.get('firebase') + '/community'));
    this.set('publicRef', new Firebase(this.get('firebase') + '/public'));
    this.set('presentUsersRef', new Firebase(this.get('firebase') + '/presence'));

    var promise = new Promise(function(resolve, reject) {

      self.get('session').fetch()
        .then(function(){
          console.log('User session preserved.');

          var tempProvider = self.get('session.provider');

          if (self.get('session.isAuthenticated')){
            self.set('userId', self.get('session.currentUser.id'));
            self.set('userData.profile', self.get('session.currentUser'));
            self.set('userData.profile.provider', tempProvider);
          }else{
            self.set('userId', null);
          }

          userUrl = self.get('firebase') + '/users/' + tempProvider + ':' + self.get('userId');

          self.set('userRef', new Firebase(userUrl));
          self.minProfileSave();
          self.Toast.addToast(self.get('i18n').t('success.logged'), 2000);
          if(transition.params['login']){
            self.get('routing').transitionTo('index');
          }
          resolve({message: 'Datapoint service correctly initialized.'});
        }, function(){
          if(!transition.params['login']){
            self.set('entryTransition', transition);
          }
          reject({message: 'No user logged in'});
        });
    });

    return promise;
  },


/*    SIGN IN AND OUT LOGIC*/

  signIn: function(provider){

    return this.get('session').open('firebase', { provider: provider}).then(function() {
      this.Toast.addToast(this.get('i18n').t('success.logged'), 2000);
      this.minProfileSave();
      if(this.get('entryTransition')){
        this.get('entryTransition').retry();
      }else{
        this.get('routing').transitionTo('index');
      }
    }.bind(this));
  },

  signOut: function(){
    // Clear all data
    this.set('userData', {});
    this.set('appData', {});
    this.set('userRef', '');
    this.set('userId', null);
    this.get('presenceRef').set(null);
    this.get('session').close().then(function(){
      this.Toast.addToast(this.get('i18n').t('success.loggedOut'), 2000);
    }.bind(this), null);

    // optional - Redirect to Login on Logout
      this.get('routing').transitionTo('login');
  },


/*    MINIMUM PROFILE FUNCTION. Checks if the user data stored in firebase is null */
  minProfileSave: function(){
    var self = this;

    function checkProfile(){
      var tempProvider = self.get('session.provider');
      self.set('userData.profile', self.get('session.currentUser'));
      self.set('userData.profile.provider', tempProvider);
      self.set('userData.securityLevel', '');
      self.grabData('userRef', ['profile'], null).then(function(data){
        if (data === null) {
          var tempUserData = self.get('session.currentUser');
          tempUserData.provider = self.get('session.provider');
          self.setData('userRef', ['profile'], tempUserData);
        }
        checkUserConfig();
      });
    }

    function checkUserConfig(){
      self.grabData('userRef', ['config'], 'userData.config').then(function(data){
        if(data === null){
          var tempConfigData = {
            'notify': false,
            'avatar': 'avatar-1'
          };
          self.setData('userRef', ['config'], tempConfigData);
        }
      });
    }

    if(this.get('userRef') !== ''){
      checkProfile();
      this.setupPresence();
    } else {
      var tempProvider = self.get("session.provider");

      if (self.get('session.isAuthenticated')){
        self.set('userId', self.get('session.currentUser.id'));
      }else{
        self.set('userId', null);
      }

      var userUrl = self.get('firebase') + '/users/' + tempProvider + ':' + self.get('userId');

      self.set('userRef', new Firebase(userUrl));
      checkProfile();
      self.setupPresence();
    }

  },

  setupPresence: function(){
    var self = this;
    this.set('onlineRef', new Firebase(this.get('firebase') + '/.info/connected'));
    this.set('presenceRef', new Firebase(this.get('firebase') + '/presence/' + this.get('session.provider') + ':' + this.get('userId')));
    this.get('onlineRef').on('value', function(snapshot) {
      if (snapshot.val()) {
        var tempUser = self.get('session.currentUser');
        self.get('presenceRef').onDisconnect().remove();
        self.get('presenceRef').set({
          'name': tempUser.displayName,
          'img' : tempUser.profileImageURL
        });
      }
    });
  },


  checkUser: function(){
    var promise = new Promise(function(resolve, reject){
      var status = this.get('session.isAuthenticated');
      if(status){
        resolve(true);
      }
      reject(false);
    }.bind(this));

    return promise;
  },

  checkSecurityLevel: function(level){
    var promise = new Promise(function(resolve, reject){
      if(this.get('userData') && this.get('userData.securityLevel') >= level){
        resolve('Access given');
      }else if(this.get('userData') && this.get('userData.securityLevel') === 'No Access'){
        reject('Security not cleared');
      }else{
        this.grabData(null, ['security', 'level'+level], null).then(function(data){
          this.set('userData.securityLevel', level);
          resolve('Access given');
        }.bind(this), function(err){
          // code to handle read error
          this.set('userData.securityLevel', 'No Access');
          console.log('Security level not high enough.');

          this.Toast.addToast(this.get('i18n').t('security.notAllowed'), 2000, 'rounded');
          reject('Security not cleared');
        }.bind(this));
      }

    }.bind(this));
    return promise;
  },


  objectToArray: function (obj) {
    var keys = Object.keys(obj);
    var items = [];
    for (var j=0; j < keys.length; j++) {
      items[j] = obj[keys[j]];
      items[j].key = keys[j];
    }
    return items;
  },


  _grabDataHelper: function(data, key){
    var keys = Object.keys(data);
    var type = typeof data[keys[0]];
    if(data !== null && type == 'object'){
      var arrData = this.objectToArray(data);
    }else if(data !== null){
      var arrData = data;
    }else{
      var arrData = null;
    }
    if (key) {
      this.set(key, arrData);
      return({message: 'Data downloaded and saved to Datapoint property: ' + key,  data: arrData});
    }else{
      return({message: 'Data downloaded. Not saved.', data: arrData});
    }
  },
/*
  // If reference null, defaults to baseRef.
  grabData: function (reference, childrenArray, dataKey) {

    var promise = new Promise(function(resolve, reject){

      //Check data function
      function checkData(self, dataKey){
        if(self.get(dataKey)){
          return true;
        }
        return false;
      }

      //Get data switch FUNCTION
      function getData(self, ref, childArray, childLen, key){
        var promise = new Promise(function (resolve, reject) {
          if(ref === null){
            ref = 'baseRef';
          }
          switch(childLen){
            case 0:

              // Get Data Once
              self.get(ref).once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
            case 1:
              self.get(ref).child(childArray[0])
                           .once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
            case 2:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
            case 3:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
            case 4:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
            case 5:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
            case 6:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .child(childArray[5])
                           .once('value',
                function(snap){
                  var values = snap.val();
                  var data = self._grabDataHelper(values, key);
                  resolve(data);
                }.bind(self), function(errorObj){
                  reject({error: errorObj});
                }.bind(self));
              break;
          };
        });
        return promise;
      }

      // Check if the dataKey has data
      if(dataKey && checkData(this, dataKey)){
        resolve(this.get(dataKey));
      }else{
        // Children length
        var childLength = childrenArray.length;
        getData(this, reference, childrenArray, childLength, dataKey)
            .then(function (dataGetResult) {
                resolve(dataGetResult.data);
            }.bind(this), function (dataGetResult) {
              reject(dataGetResult.error);
            }.bind(this));
      }
    }.bind(this));
    return promise;

  },

  */

  // If reference null, defaults to baseRef.
  grabData: function (reference, childrenArray, dataKey) {

    var promise = new Promise(function(resolve, reject){

      //Check data function
      function checkData(self, dataKey){
        if(self.get(dataKey)){
          return true;
        }
        return false;
      }

      //Get data switch FUNCTION
      function getData(self, ref, childArray, key){
        var promise = new Promise(function (resolve, reject) {

          var instruction = '';

          if(ref === null){
            ref = 'baseRef';
          }

          instruction += 'self.get("' + ref + '")';

          for (var i = 0; i < childArray.length; i++) {
            instruction += '.child("' + childArray[i] + '")';
          }

          eval(instruction).once('value',
            function(snap){
              var values = snap.val();
              var data = self._grabDataHelper(values, key);
              resolve(data);
            }.bind(self), function(errorObj){
              reject({error: errorObj});
            }.bind(self));
        });
        return promise;
      }

      // Check if the dataKey has data
      if(dataKey && checkData(this, dataKey)){
        resolve(this.get(dataKey));
      }else{

        getData(this, reference, childrenArray, dataKey)
            .then(function (dataGetResult) {
                resolve(dataGetResult.data);
            }.bind(this), function (dataGetResult) {
              reject(dataGetResult.error);
            }.bind(this));
      }
    }.bind(this));
    return promise;

  },

  // If reference null, defaults to baseRef.
  deleteData: function (reference, childrenArray) {

    var promise = new Promise(function(resolve, reject){

      //Get data switch FUNCTION
      function deleteFunction(self, ref, childArray, childLen){
        var promise = new Promise(function (resolve, reject) {
          if(ref === null){
            ref = 'baseRef';
          }
          // Set Data
          switch(childLen){
            case 0:
              self.get(ref).remove(function(){
                              resolve({message: 'Data erased'});
                            });
              break;
            case 1:
              self.get(ref).child(childArray[0])
                           .remove(function(){
                             resolve({message: 'Data erased'});
                           });
              break;
            case 2:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .remove(function(){
                             resolve({message: 'Data erased'});
                           });
              break;
            case 3:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .remove(function(){
                             resolve({message: 'Data erased'});
                           });
              break;
            case 4:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .remove(function(){
                             resolve({message: 'Data erased'});
                           });
              break;
            case 5:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .remove(function(){
                             resolve({message: 'Data erased'});
                           });
              break;
            case 6:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .child(childArray[5])
                           .remove(function(){
                             resolve({message: 'Data erased'});
                           });
              break;
          };
        });
        return promise;
      }

      // Children length
      var childLength = childrenArray.length;
      deleteFunction(this, reference, childrenArray, childLength)
          .then(function (dataGetResult) {
              resolve(dataGetResult.message);
          }.bind(this), function (dataGetResult) {
            reject(dataGetResult);
          }.bind(this));
    }.bind(this));
    return promise;

  },

  // If reference null, defaults to baseRef.
  setData: function (reference, childrenArray, data) {

    var promise = new Promise(function(resolve, reject){

      //Get data switch FUNCTION
      function setFunction(self, ref, childArray, childLen, data){
        var promise = new Promise(function (resolve, reject) {
          if(ref === null){
            ref = 'baseRef';
          }
          // Set Data
          switch(childLen){
            case 0:
              self.get(ref).set(data, function(){
                resolve({message: 'Data Saved'});
              });
              break;
            case 1:
              self.get(ref).child(childArray[0])
                           .set(data, function(){
                             resolve({message: 'Data Saved'});
                           });
              break;
            case 2:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .set(data, function(){
                             resolve({message: 'Data Saved'});
                           });
              break;
            case 3:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .set(data, function(){
                             resolve({message: 'Data Saved'});
                           });
              break;
            case 4:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .set(data, function(){
                             resolve({message: 'Data Saved'});
                           });
              break;
            case 5:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .set(data, function(){
                             resolve({message: 'Data Saved'});
                           });
              break;
            case 6:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .child(childArray[5])
                           .set(data, function(){
                             resolve({message: 'Data Saved'});
                           });
              break;
          };
        });
        return promise;
      };

      // Children length
      var childLength = childrenArray.length;
      setFunction(this, reference, childrenArray, childLength, data)
          .then(function (dataGetResult) {
              resolve(dataGetResult.message);
          }.bind(this), function (dataGetResult) {
            reject(dataGetResult);
          }.bind(this));
    }.bind(this));
    return promise;

  },

  turnFireOff: function(reference, childrenArray){
    // Abstract

    /*

      Function.
      Will take care of turning socket off

      This is a simple helper function. Not intended to be used necessarily in
      real time uses. This is due to the posible simplicity of doing the same.

      After a developer might open a real time socket with firebase using the following:

        this.Data.get('userRef').child('profile').on('value', function(data){
          //Save data
        }, function(error){
          //Display error
        });

        or

        this.Data.get('userRef').child('profile').once('value', function(data){
          //Save data
        }, function(error){
          //Display error
        });


        this.Data.get('userRef').child('profile').on('child_added', function(newData, previousDataId){
          //Add/process new data
        }, function(error){
          //Display error
        });


        this.Data.get('userRef').child('profile').on('child_removed', function(deletedData, previousDataId){
          //Remove/process old data
        }, function(error){
          //Display error
        });

      Once the flow has been controlled, if we leave the page and want to close the socket
      we could do this by:

        Calling this method - this.Data.turnFireOff()

        or

        this.Data.get(ref).child(...).child(....).off();


      Either way, same effect is obtained.



    */

    var promise = new Promise(function(resolve, reject){

      //Get data switch FUNCTION
      function turnOff(self, ref, childArray, childLen){
        var promise = new Promise(function (resolve, reject) {
          if(ref === null){
            ref = 'baseRef';
          }
          // Set Data
          switch(childLen){
            case 0:
              self.get(ref).off();
              resolve();
              break;
            case 1:
              self.get(ref).child(childArray[0])
                           .off();
              resolve();
              break;
            case 2:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .off();
              resolve();
              break;
            case 3:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .off();
              resolve();
              break;
            case 4:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .off();
              resolve();
              break;
            case 5:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .off();
              resolve();
              break;
            case 6:
              self.get(ref).child(childArray[0])
                           .child(childArray[1])
                           .child(childArray[2])
                           .child(childArray[3])
                           .child(childArray[4])
                           .child(childArray[5])
                           .off();
              resolve();
              break;
          };
        });
        return promise;
      };

      // Children length
      var childLength = childrenArray.length;
      turnOff(this, reference, childrenArray, childLength)
          .then(function () {
              resolve('Socket turned off.');
          }.bind(this));
    }.bind(this));
    return promise;
  }
});



/*

PROMISE BASE
------------

var promise = new Promise(function(resolve, reject){

});
return promise;
*/

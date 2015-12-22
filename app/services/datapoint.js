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
    this.set('entryTransition', null);
    this.get('presenceRef').set(null);
    this.get('session').close().then(function(){
      this.Toast.addToast(this.get('i18n').t('success.loggedOut'), 2000);

      // optional - Redirect to Login on Logout
      this.get('routing').transitionTo('index');
    }.bind(this), null);
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


  checkUser: function(transition){
    var promise = new Promise(function(resolve, reject){
      var status = this.get('session.isAuthenticated');
      if(status){
        resolve(true);
        return;
      }

      reject(false);
    }.bind(this));

    return promise;
  },

  checkSecurityLevel: function(level, transition){
    var promise = new Promise(function(resolve, reject){
      if(this.get('userData') && this.get('userData.securityLevel') >= level){
        resolve('Access given');
      }else if(this.get('userData') && this.get('userData.securityLevel') === 'No Access'){
        this.Toast.addToast(this.get('i18n').t('security.notAllowed'), 2000);
        reject('Security not cleared');
      }else{
        this.grabData(null, ['security', 'level'+level], null).then(function(data){
          this.set('userData.securityLevel', level);
          resolve('Access given');
        }.bind(this), function(err){
          // code to handle read error
          this.set('entryTransition', transition);
          this.set('userData.securityLevel', 'No Access');
          console.log('Security level not high enough.');

          this.Toast.addToast(this.get('i18n').t('security.notAllowed'), 2000);
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
    if(data === null){
      var arrData = null;
    }else{
      var keys = Object.keys(data);
      var type = typeof data[keys[0]];
      if(data !== null && type == 'object'){
        var arrData = this.objectToArray(data);
      }else{
        var arrData = data;
      }
    }

    if (key) {
      this.set(key, arrData);
      return({message: 'Data downloaded and saved to Datapoint property: ' + key,  data: arrData});
    }else{
      return({message: 'Data downloaded. Not saved.', data: arrData});
    }
  },

  // If reference null, defaults to baseRef.
  grabData: function (reference, childrenArray, dataKey, filtersObj) {

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

          instruction = self.get(ref);

          for (var i = 0; i < childArray.length; i++) {
            instruction = instruction.child(childArray[i]);
          }

          if(filtersObj) {
            if(filtersObj.orderChild) {
              instruction = instruction.orderByChild(filtersObj.orderChild);
            }
            if(filtersObj.equalTo) {
              instruction = instruction.equalTo(filtersObj.equalTo);
            }
            if(filtersObj.startAt) {
              instruction = instruction.startAt(filtersObj.startAt);
            }
            if(filtersObj.endAt) {
              instruction = instruction.endAt(filtersObj.endAt);
            }
            if(filtersObj.limitToFirst) {
              instruction = instruction.limitToFirst(filtersObj.limitToFirst);
            }
            if(filtersObj.limitToLast) {
              instruction = instruction.limitToLast(filtersObj.limitToLast);
            }
          }

          instruction.once('value',
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
      function deleteFunction(self, ref, childArray){
        var promise = new Promise(function (resolve, reject) {
          var instruction = '';
          if(ref === null){
            ref = 'baseRef';
          }
          instruction = self.get(ref);

          for (var i = 0; i < childArray.length; i++) {
            instruction = instruction.child(childArray[i]);
          }

          instruction.remove(function(){
                          resolve({message: 'Data erased'});
                        });

        });
        return promise;
      }

      deleteFunction(this, reference, childrenArray)
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
      function setFunction(self, ref, childArray, data){
        var promise = new Promise(function (resolve, reject) {
          var instruction = '';
          if(ref === null){
            ref = 'baseRef';
          }
          instruction = self.get(ref);

          for (var i = 0; i < childArray.length; i++) {
            instruction = instruction.child(childArray[i]);
          }

          instruction.set(data, function(){
            resolve({message: 'Data Saved'});
          });
        });
        return promise;
      };

      setFunction(this, reference, childrenArray, data)
          .then(function (dataGetResult) {
              resolve(dataGetResult.message);
          }.bind(this), function (dataGetResult) {
            reject(dataGetResult);
          }.bind(this));
    }.bind(this));
    return promise;

  },

  turnFireOff: function(reference, childrenArray){
    var promise = new Promise(function(resolve, reject){

      //Get data switch FUNCTION
      function turnOff(self, ref, childArray){
        var promise = new Promise(function (resolve, reject) {
          var instruction = '';
          if(ref === null){
            ref = 'baseRef';
          }
          instruction = self.get(ref);

          for (var i = 0; i < childArray.length; i++) {
            instruction = instruction.child(childArray[i]);
          }

          instruction.off();
          resolve();
        });
        return promise;
      };

      turnOff(this, reference, childrenArray)
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

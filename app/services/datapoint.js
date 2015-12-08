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
      self.get('userRef').child('profile').on("value", function(snapshot) {
        if (snapshot.val() === null) {
          var tempUserData = self.get('session.currentUser');
          tempUserData.provider = self.get('session.provider');
          self.get('userRef').child('profile').set(tempUserData);
        }
      });
    }

    function checkUserConfig(){
      self.get('userRef').child('config').once("value", function(snapshot) {
        if (snapshot.val() === null) {
          var tempConfigData = {
            'notify': false,
            'avatar': 'avatar-1'
          };
          self.get('userRef').child('config').set(tempConfigData);
        }
      });
    }

    if(this.get('userRef') !== ''){
      checkProfile();
      checkUserConfig();
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
      checkUserConfig();
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
      if(this.get('userData.securityLevel') && this.get('userData.securityLevel') == level){
        resolve('Access given');
      }else if(this.get('userData.securityLevel') === 'No Access'){
        reject('Security not cleared');
      }else{
        this.get('baseRef').child('security').child('level' + level).once('value', function (snapshot) {
          this.set('userData.securityLevel', level);
          resolve('Access given');
        }.bind(this), function (err) {
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
  }
});



/*

PROMISE BASE
------------

var promise = new Promise(function(resolve, reject){

});
return promise;
*/

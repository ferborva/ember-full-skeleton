import Ember from 'ember';

export default Ember.Service.extend({

  session: Ember.inject.service(),
  i18n: Ember.inject.service(),

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


  initialize: function(){
    console.log('DATAPOINT-SERVICE: Init()');

    var userUrl = '',
        self = this;

      // Set baseRef
    this.set('baseRef', new window.Firebase(this.get('firebase')));
    this.set('communityRef', new window.Firebase(this.get('firebase') + '/community'));
    this.set('publicRef', new window.Firebase(this.get('firebase') + '/public'));

    var promise = new window.Promise(function(resolve, reject) {

      self.get("session").fetch()
        .then(function(){
          console.log('User session preserved.');

          var tempProvider = self.get("session.provider");

          if (self.get('session.isAuthenticated')){
            self.set('userId', self.get('session.currentUser.id'));
          }else{
            self.set('userId', null);
          }

          userUrl = self.get('firebase') + '/users/' + tempProvider + ':' + self.get('userId');

          self.set('userRef', new window.Firebase(userUrl));
          self.minProfileSave();
          self.toast.addToast(self.get('i18n').t('success.logged'), 2000);
          resolve({message: 'Datapoint service correctly initialized.'});
        }, function(){
          console.log('User not logged in!');
          self.toast.addToast(self.get('i18n').t('error.notLogged'), 2000);
          reject({message: 'No user logged in'});
        });
    });

    return promise;
  },



/*    GETTERS AND SETTERS   */

  getFirebase: function(){
    return this.get('firebase');
  },

  setFirebase: function(appName){
    appName = 'https://' + appName + '.firebaseio.com';
    this.set('firebase', appName);
    this.initialize();
  },

  getBaseRef: function(){
    return this.get('baseRef');
  },

  getUserRef: function(){
    return this.get('userRef');
  },


/*    SIGN IN AND OUT LOGIC*/

  signIn: function(provider){
    return this.get("session").open("firebase", { provider: provider}).then(function() {
      this.toast.addToast(this.get('i18n').t('success.logged'), 2000);
      this.minProfileSave();
    }.bind(this));
  },

  signOut: function(){
    var self = this;
    this.set('userRef', '');
    this.set('userId', null);
    this.get('presenceRef').set(null);
    this.get("session").close().then(function(){
      self.toast.addToast(self.get('i18n').t('success.loggedOut'), 2000);
    }, null);
  },


/*    MINIMUM PROFILE FUNCTION. Checks if the user data stored in firebase is null */
  minProfileSave: function(){
    var self = this;

    function checkProfile(){
      self.get('userRef').child('profile').on("value", function(snapshot) {
        if (snapshot.val() === null) {
          var tempUserData = self.get('session.currentUser');
          tempUserData.provider = self.get('session.provider');
          self.get('userRef').child('profile').set(tempUserData);
        }
      });
    }

    function checkUserConfig(){
      self.get('userRef').child('config').on("value", function(snapshot) {
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

      self.set('userRef', new window.Firebase(userUrl));
      checkProfile();
      checkUserConfig();
      self.setupPresence();
    }

  },

  setupPresence: function(){
    var self = this;
    this.set('onlineRef', new window.Firebase(this.get('firebase') + '/.info/connected'));
    this.set('presenceRef', new window.Firebase(this.get('firebase') + '/presence/' + this.get('session.provider') + ':' + this.get('userId')));
    this.set('presentUsersRef', new window.Firebase(this.get('firebase') + '/presence'));
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

  getPresence: function(){
    return this.get('presentUsersRef');
  }



});

import Ember from 'ember';

export default Ember.Service.extend({

  session: Ember.inject.service(),
  i18n: Ember.inject.service(),

  firebase: 'https://cfmcom.firebaseio.com',
  baseRef: '',
  userRef: '',
  quizRef: '',
  dataRef: '',
  userId: null,


  initialize: function(){
    console.log('DATAPOINT-SERVICE: Init()');

    var userUrl = '',
        self = this;

      // Set baseRef
    this.set('baseRef', new window.Firebase(this.get('firebase')));

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
          self.toast.addToast(self.get('i18n').t('success.logged'), 2000, 'rounded');
          resolve({message: 'Datapoint service correctly initialized.'});
        }, function(){
          console.log('User not logged in!');
          self.toast.addToast(self.get('i18n').t('error.notLogged'), 2000, 'rounded');
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
    return this.get("session").open("firebase", { provider: provider}).then(function(data) {
      console.log(data.currentUser);
      this.toast.addToast(this.get('i18n').t('success.logged'), 2000, 'rounded');
      this.minProfileSave();
    }.bind(this));
  },

  signOut: function(){
    var self = this;
    this.get("session").close().then(function(){
      self.toast.addToast(self.get('i18n').t('success.loggedOut'), 2000, 'rounded');
    }, null);
  },


/*    MINIMUM PROFILE FUNCTION. Checks if the user data stored in firebase is null */
  minProfileSave: function(){
    var self = this;
    if(this.get('userRef') !== ''){
      this.get('userRef').child('profile').on("value", function(snapshot) {
        if (snapshot.val() === null) {
          var tempUserData = self.get('session.currentUser');
          tempUserData.provider = self.get('session.provider');
          self.get('userRef').child('profile').set(tempUserData);
        }
      });
    }
  }



});

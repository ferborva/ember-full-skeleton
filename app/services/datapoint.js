import Ember from 'ember';

export default Ember.Service.extend({

  session: Ember.inject.service(),

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
          self.minProfile();
          // self.get('userRef').child('profile').set({name: 'tempUser'});
          resolve({message: 'Datapoint service correctly initialized.'});
        }, function(){
          console.log('User not logged in!');
          reject({message: 'No user logged in'});
        });
    });

    return promise;
  },

  setFirebase: function(appName){
    appName = 'https://' + appName + '.firebaseio.com';
    this.set('firebase', appName);
    this.initialize();
  },

  getFirebase: function(){
    return this.get('firebase');
  },

  getBaseRef: function(){
    return this.get('baseRef');
  },

  getUserRef: function(){
    return this.get('userRef');
  },

  signIn: function(provider){
    return this.get("session").open("firebase", { provider: provider}).then(function(data) {
      console.log(data.currentUser);
      this.minProfile();
    }.bind(this));
  },

  signOut: function(){
    this.get("session").close();
  },

  minProfile: function(){
    var self = this;
    if(this.get('userRef') !== ''){
      this.get('userRef').child('profile').on("value", function(snapshot) {
        if (snapshot.val() === null) {
          var tempUserData = self.get('session.currentUser');
          self.get('userRef').child('profile').set(tempUserData);
        }
      });
    }
  }



});

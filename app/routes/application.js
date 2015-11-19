import Ember from 'ember';


export default Ember.Route.extend({

  beforeModel: function() {

    this.set('i18n.locale', navigator.language || navigator.userLanguage || 'es');

    return this.get("session").fetch().catch(function() {});

  },

  actions: {

    signIn: function(provider) {
      this.get("session").open("firebase", { provider: provider}).then(function(data) {
        console.log(data.currentUser);
      });
    },

    signOut: function() {
      this.get("session").close();
    }
  }
});

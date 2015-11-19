import Ember from 'ember';


export default Ember.Route.extend({

  beforeModel: function() {

    this.set('i18n.locale', navigator.language || navigator.userLanguage || 'es');

    // Initialize the datapoint
    return this.Data.initialize().then(function(){
      console.log('ALl is good');
    }, function(error){
      console.log('Problems I see young padawan.' + error.message);
    }).catch(function(){
      console.log('Something went wrong.');
    });

  },

  actions: {

    signIn: function(provider) {
      this.Data.signIn(provider);
    },

    signOut: function() {
      this.Data.signOut();
    }
  }
});

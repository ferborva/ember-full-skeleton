import Ember from 'ember';


export default Ember.Route.extend({

  beforeModel: function(transition) {

    this.set('i18n.locale', navigator.language || navigator.userLanguage || 'es');

    // Initialize the datapoint
    return this.Data.initialize(transition).then(function(){
      console.log('Your are ready to rock & roll!');
      console.log('-------------------------------');
      console.log('-------------------------------');
      console.log('"self" is defined but never used xD');
      console.log('-------------------------------');
      console.log('-------------------------------');
    }, function(){
        // Abstract: catch error on datapoint intialization
    });

  },

  actions: {

    signIn: function(provider) {
      this.Data.signIn(provider);
    },

    signOut: function() {
      this.Data.signOut();
    },

    redirectHome: function(){
      this.transitionTo('index');
      // Hide sideNav
      $('.button-collapse').sideNav('hide');
    },

    setLocale: function (locale) {
      this.set('i18n.locale', locale);
      this.Toast.addToast(this.get('i18n').t('label.languageChange'), 2000);
    },

    focus: function(id, animation, speed){
      id = '#' + id;
      this.Animate.go(id,animation,speed);
    },

    focusHoverIn: function (id) {
      id = '#' + id;
      $(id).addClass('block-focus-border');
    },

    focusHoverOut: function (id) {
      id = '#' + id;
      $(id).removeClass('block-focus-border');
    },

    yesToModal: function(){
      $('.modal-action').click();
      var data = {
        message: 'yes',
        action: this.Data.get('modalAction'),
        data: this.Data.get('modalData')
      };
      var currPath = this.router.currentRouteName;
      Flamestack.__container__.lookup('controller:' + currPath).set('modalAnswer', data);
    },

    noToModal: function(){
      $('.modal-action').click();
      var data = {
        message: 'no',
        action: this.Data.get('modalAction'),
        data: this.Data.get('modalData')
      };
      var currPath = this.router.currentRouteName;
      Flamestack.__container__.lookup('controller:' + currPath).set('modalAnswer', data);
    }
  }
});

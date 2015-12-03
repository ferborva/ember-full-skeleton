import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel: function(transition){
    // Check User
    return this.Data.checkUser(transition).then(function(){
      console.log('Move along sir ...');
    }, function(){
      this.Toast.addToast(this.get('i18n').t('error.notLogged'), 3000);
      this.transitionTo('login');
    }.bind(this));
  },

  actions: {
        didTransition: function() {
          this.Animate.entryPage('.page', 'fadeInRightBig');
        },

        willTransition: function(transition){
          this.Animate.exitPage('.page','fadeOutRightBig', transition, 'fast');
        }
    }

});

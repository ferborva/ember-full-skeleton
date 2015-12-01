import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel: function(transition){
    // Check User
    return this.Data.checkUser(transition).then(function(){
      console.log('Your are ready to rock & roll!');
    }, function(error){
      console.log(error);
      this.Toast.addToast(this.get('i18n').t('error.notLogged'), 3000);
      this.transitionTo('login');
    }.bind(this));
  }

});

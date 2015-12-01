import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel: function(transition){
    // Check User
    return this.Data.checkUser(transition).then(function(){
      console.log('Your are ready to rock & roll!');
    }, function(){
      console.log('Your are ready to rock & roll! But log yourself in first');
      this.transitionTo('login');
    }.bind(this));
  }

});

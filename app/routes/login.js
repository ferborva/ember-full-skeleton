import Ember from 'ember';

export default Ember.Route.extend({

  hasAnimated: false,

  actions:{

    didTransition: function(){
      $('#login-page').removeClass('hide');
      Ember.run.scheduleOnce('afterRender', this, function() {
          // If the models are already cached, the element exists.
          this.Animate.go('.page', 'fadeInUpBig').then(function(){
          }.bind(this));
      });
    },

    willTransition: function(transition){
      if(!this.get('hasAnimated')){
        transition.abort(); 
        this.Animate.goAndHide('#login-page', 'flipOutX').then(function(){
          this.set('hasAnimated', true);
          transition.retry();
        }.bind(this));
        return true;
      }
      this.set('hasAnimated', false);
      return true;
    }
  }

});

import Ember from 'ember';

export default Ember.Route.extend({

  hasAnimated: false,

  actions:{

    didTransition: function(){
      window.$('#login-page').removeClass('hide');
      this.Animate.entryPage('.page', 'fadeInUpBig');
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

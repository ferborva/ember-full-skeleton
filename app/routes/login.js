import Ember from 'ember';

export default Ember.Route.extend({

  actions:{

    didTransition: function(){
      window.$('#login-page').removeClass('hide');
      this.Animate.entryPage('.page', 'fadeInDownBig', 'slow');
    },

    willTransition: function(transition){
      this.Animate.exitPage('.page','fadeOutUpBig', transition, 'slow');
    }
  }

});

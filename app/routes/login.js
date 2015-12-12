import Ember from 'ember';

export default Ember.Route.extend({

  existingUsers: '',

  actions:{

    didTransition: function(){
      $('#login-page').removeClass('hide');
      this.Animate.entryPage('.page', 'fadeInDownBig', 'normal');
    },

    willTransition: function(transition){
      this.Animate.exitPage('.page','flipOutX', transition);
    }
  }

});

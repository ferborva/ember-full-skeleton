import Ember from 'ember';

export default Ember.Route.extend({

  model: function(){
    var promise = new Promise(function(resolve){
      setTimeout(function(){
        resolve();
      }, 1000);
    });
    return promise;
  },

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

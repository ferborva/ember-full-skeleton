import Base from './../base';

export default Base.extend({
  auth: true,

  model: function(){
    var promise = new Promise(function(resolve, reject){
      resolve();
    });

    return promise;
  },

  actions: {
        didTransition: function() {
          this.Animate.entryPage('.page', 'fadeIn', 'fast');
        },

        willTransition: function(transition){
          this.Animate.exitPage('.page','fadeOut', transition, 'fast');
        }
    }
});

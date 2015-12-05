import Base from './../base';

export default Base.extend({
  auth: true,

  actions: {
        didTransition: function() {
          this.Animate.entryPage('.page', 'fadeInUpBig');
        },

        willTransition: function(transition){
          this.Animate.exitPage('.page','fadeOutDownBig', transition, 'fast');
        }
    }
});

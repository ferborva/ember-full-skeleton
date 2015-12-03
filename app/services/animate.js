import Ember from 'ember';

export default Ember.Service.extend({

  go: function(node, animation){

    var promise = new window.Promise(function(resolve) {
      var animString = 'animated ' + animation;
      window.$(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function(){
          window.$(node).removeClass(animString);
          resolve('end');
        });
    });
    return promise;

  },

  goAndHide: function(node, animation){

    var promise = new window.Promise(function(resolve) {
      var animString = 'animated ' + animation;
      window.$(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function(){
          window.$(node).addClass('hide').removeClass(animString);
          resolve('end');
        });
    });
    return promise;

  },


  entryPage: function(node, animation, speed){
    window.$(node).removeClass('anim-normal anim-slow anim-fast');
    var promise = new window.Promise(function(resolve) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        var animString = 'animated ' + animation;
        if (speed) {
          var animspeed = 'anim-' + speed;
          window.$(node).addClass(animspeed);
        } else {
          window.$(node).addClass('anim-normal');
        }
        window.$(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function(){
            window.$(node).removeClass(animString);
            resolve('end');
          });
        });
    });
    return promise;
  },

  pageTransitionComplete: false,

  exitPage: function(node, animation, transition, speed){
    window.$(node).removeClass('anim-normal anim-slow anim-fast');
    var promise = new window.Promise(function(resolve) {
      if(!this.get('pageTransitionComplete')){
        if (speed) {
          var animspeed = 'anim-' + speed;
          window.$(node).addClass(animspeed);
        } else {
          window.$(node).addClass('anim-normal');
        }
        transition.abort();
        this.goAndHide(node, animation).then(function(){
          this.set('pageTransitionComplete', true);
          transition.retry().then(function(){
            resolve('end');
          });
        }.bind(this));
      }else{
        this.set('pageTransitionComplete', false);
        resolve('secondRun');
      }
    }.bind(this));
    return promise;
  }

});

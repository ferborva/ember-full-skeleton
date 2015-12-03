import Ember from 'ember';

export default Ember.Service.extend({

  go: function(node, animation){

    var promise = new window.Promise(function(resolve) {
      var animString = 'animated ' + animation;
      window.$(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function(){
          console.log('animation ended');
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
          console.log('animation ended');
          window.$(node).addClass('hide').removeClass(animString);
          resolve('end');
        });
    });
    return promise;

  },


  entryPage: function(node, animation){
    var promise = new window.Promise(function(resolve) {
      Ember.run.scheduleOnce('afterRender', this, function() {
        var animString = 'animated ' + animation;
        window.$(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
          function(){
            window.$(node).removeClass(animString);
            resolve('end');
          });
        });
    });
    return promise;
  }

});

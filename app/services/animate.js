import Ember from 'ember';

export default Ember.Service.extend({

  go: function(node, animation){

    var promise = new Promise(function(resolve) {
      var animString = 'animated ' + animation;
      $(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function(){
          console.log('animation ended');
          $(node).removeClass(animString);
          resolve('end');
        });
    });
    return promise;

  },

  goAndHide: function(node, animation){

    var promise = new Promise(function(resolve) {
      var animString = 'animated ' + animation;
      $(node).addClass(animString).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function(){
          console.log('animation ended');
          $(node).addClass('hide').removeClass(animString);
          resolve('end');
        });
    });
    return promise;

  }

});

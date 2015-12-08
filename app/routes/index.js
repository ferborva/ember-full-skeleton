import Base from './base';

export default Base.extend({

  auth: true,

  model: function () {
    var promise = new Promise(function(resolve, reject) {
      this.Data.openSocket('presentUsersRef', [], 'onlineUsers').then(
        function (data) {
          resolve(data);
        }.bind(this),
        function (errorObj) {
          reject(errorObj);
        }.bind(this)
      );
    }.bind(this));

    return promise;
  },

  actions: {

    focus: function(id, animation, speed){
      id = '#' + id;
      this.Animate.go(id,animation,speed);
    }

  }

});

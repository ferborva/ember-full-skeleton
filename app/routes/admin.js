import Base from './base';

export default Base.extend({

  auth: true,
  securityLevel: 3,

  model: function(){
    var promise = new Promise(function(resolve, reject){
      // Grab data. If found in datapoint.key (existingUsers in this case) else from server.
      this.Data.grabData(null, ['users'], 'existingUsers').then(
        function (data) {
          // Users retrieved, saved to a Datapoint property
          // and aliased to our controller property for use.

          if(!data[0].roleLevel){
            // Get user roles
            this.Data.grabData(null, ['roles'], 'roles').then(function(data){
                if (data !== null) {
                  var users = this.Data.get('existingUsers');
                  for (var i = 0; i < users.length; i++) {
                    var found = false;
                    for (var j = 0; j < data.length; j++) {
                      if(users[i].key === data[j].key){
                        users[i].roleLevel = data[j].level;
                        found= true;
                      }
                    }
                    if(!found){
                      users[i].roleLevel = null;
                    }
                  }
                  this.Data.set('existingUsers', users);
                  resolve();
                }
            }.bind(this), function(){
              reject();
            }.bind(this));
          }
          else{
            resolve();
          }

        }.bind(this),
        function (errorObj) {
          console.log('FLAME_ERROR_LOG: Failed on grabData method call. You might have lost your internet conexion.')
          reject();
        }.bind(this)
      );
    }.bind(this));

    return promise;

  },

  setupController: function(controller, model){
    controller.setup();
  },

  actions: {
    willTransition: function(transition){
      this.Data.turnFireOff(null, ['presence']);
      this._super(transition);
    }
  }

});

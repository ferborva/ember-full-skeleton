import Ember from 'ember';

export default Ember.Controller.extend({
  onlineUsers: '',

  Data: Ember.inject.service('datapoint'),

  init: function(){
    var self = this;
    this._super.apply(this, arguments);
    var dataUrl = new window.Firebase('https://cfmcom.firebaseio.com/presence');
    dataUrl.on('value', function(snapshot){
        var unsorted = snapshot.val();
        if (unsorted !== null) {
          var keys = Object.keys(unsorted);
          var items = [];
          for (var j=0; j < keys.length; j++) {
            items[j] = unsorted[keys[j]];
            items[j].key = keys[j];
          }
          self.set('onlineUsers', items);
        } else {
          self.set('onlineUsers', '');
        }
    });
  }
});

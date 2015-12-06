import Base from './../../base';

export default Base.extend({
  auth: true,
  model: function(){
    var promise = new Promise(function(resolve, reject){
      this.Data.get('userRef').child('config').child('categorias').once('value', function(snap){
        var data = this.Data.objectToArray(snap.val());
        var arrData = [];
        for (var i = 0; i < data.length; i++) {
          arrData.push(data[i].name);
        }
        localStorage.setItem('categorias', JSON.stringify(arrData));
        resolve();
      }.bind(this), function(err){
        console.log(err);
        return false;
      }.bind(this));
    }.bind(this));

    return promise;
  },

  actions: {
        didTransition: function() {
          this.Animate.entryPage('.page', 'fadeInUpBig');
        },

        willTransition: function(transition){
          this.Animate.exitPage('.page','fadeOutDownBig', transition, 'fast');
        }
    }
});

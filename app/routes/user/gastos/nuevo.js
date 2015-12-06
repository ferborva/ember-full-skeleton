import Base from './../../base';

export default Base.extend({
  auth: true,
  model: function(){
    var promise = new Promise(function(resolve, reject){
      this.Data.get('userRef').child('config').on('value', function(snap){
        var categorias = this.Data.objectToArray(snap.val().categorias);
        var sistemas = this.Data.objectToArray(snap.val().sistemas);
        var arrData1 = [];
        var arrData2 = [];
        for (var i = 0; i < categorias.length; i++) {
          arrData1.push(categorias[i].name);
        }
        for (var i = 0; i < sistemas.length; i++) {
          arrData2.push(sistemas[i].name);
        }
        localStorage.setItem('categorias', JSON.stringify(arrData1));
        localStorage.setItem('sistemas', JSON.stringify(arrData2));
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

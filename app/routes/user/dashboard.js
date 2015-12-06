import Base from './../base';

export default Base.extend({
  auth: true,

  model: function(){
    var promise = new Promise(function(resolve, reject){
      this.Data.get('userRef').child('datos').once('value', function(snap){
        var fullData = snap.val();
        if(fullData === null){
          resolve({data: false});
          return;
        }
        if(fullData.gastos){
          var gastos = this.Data.objectToArray(fullData.gastos);
        }else{
          var gastos = null;
        }

        if(fullData.ingresos){
          var ingresos = this.Data.objectToArray(fullData.ingresos);
        }else{
          var ingresos = null;
        }

        var totalGastos = 0,
            totalIngresos = 0;

        if(gastos){
          for (var i = 0; i < gastos.length; i++) {
            totalGastos += Number(gastos[i].importe);
          }
        }

        if(ingresos){
          for (var i = 0; i < ingresos.length; i++) {
            totalIngresos += ingresos[i].importe;
          }
        }
        resolve({totalGastos: totalGastos, totalIngresos: totalIngresos});
      }.bind(this), function(err){
        console.log(err);
        return false;
      }.bind(this));
    }.bind(this));

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

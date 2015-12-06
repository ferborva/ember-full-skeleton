import Ember from 'ember';

export default Ember.Controller.extend({

  gasto: {
    tipo: '',
    importe: '',
    descripcion: '',
    sistema: '',
    fecha: ''
  },

  init: function(){
      var currentTime = new Date();
      console.log(currentTime);
      var tempYear = currentTime.getFullYear();
      var tempMonth = currentTime.getMonth() + 1;
      if(tempMonth <10){
        tempMonth = '0' + tempMonth;
      }
      var tempDay = currentTime.getDate()+1;
      if(tempDay < 10){
        tempDay = '0' + tempDay;
      }
      var currentString = tempYear + '-' + tempMonth + '-' + tempDay;
      console.log(currentString);
      this.set('gasto.fecha', currentString);
  },


  categorias: ['Indefinida', 'Carrefour', 'Mercadona', 'Regalos', 'Extra'],

  sistemas: ['Cash', 'Cuenta 1', 'Cuenta Bankia', 'PayPal Berta'],

  actions: {
    guardarGasto: function(){
      if(this.get('gasto.sistema') === ''){
        this.set('gasto.sistema', 'Cash');
      }
      this.Data.get('userRef').child('datos').child('gastos').push(this.get('gasto'));
      this.transitionToRoute('user.dashboard');
      this.Toast.addToast('Gasto registrado', 1500);
    }
  }
});

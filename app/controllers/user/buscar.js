import Ember from 'ember';

export default Ember.Controller.extend({

  loading: false,
  paginasGastos: '',
  paginasIngresos: [],
  itemsPerPage: 10,
  gastos: true,
  datosLista: '',

  init: function(){
      this.set('loading', true);

      Ember.RSVP.allSettled([this._getPages(), this._getDatos()]).then(function(data){
        this.set('loading', false);
      }.bind(this), function(err){

      }.bind(this));

  },

  _getPages: function () {
    var promisePages = new Promise (function(resolve){
      this.Data.get('userRef')
          .child('datos')
          .child('stats')
          .on('value', function(snap){
            var values = snap.val();
            if(values && values.numGastos > 0){
              var tempNum = values.numGastos / this.get('itemsPerPage');
              tempNum = Math.ceil(tempNum);
              var tempPaginas = [];
              while(tempNum > 0){
                var pageObj = {
                  page : tempNum,
                  state: false,
                };
                if(tempNum === 1){
                  pageObj.state = true;
                  tempPaginas.push(pageObj);
                }else{
                  tempPaginas.push(pageObj);
                }

                tempNum -= 1;
              }
              this.set('paginasGastos', tempPaginas);
              resolve('Existed páginas de gastos');
            }else{
              this.set('paginasGastos', [0]);
              resolve('No existen gastos');
            }
          }.bind(this));
    }.bind(this));
    return promisePages;
  },

  _getDatos: function(){
    var promiseDatos = new Promise(function(resolve){
      if(this.get('gastos')){
        this.Data.get('userRef').child('datos').child('gastos').on('value', function(snap){
          var value = snap.val();
          if (value) {
            var arrData = this.Data.objectToArray(snap.val());
            for (var i = 0; i < arrData.length; i++) {
              var date = new Date(arrData[i].fecha);
              console.log(date);
              var tempString = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + (date.getDate());
              arrData[i].fecha = tempString;
            }
            this.set('datosLista', arrData);
          }
          resolve('Datos encontrados');
        }.bind(this), function(err){
          console.log(err);
          resolve({error: err});
        });
      }else{
        this.Data.get('userRef').child('datos').child('ingresos').on('value', function(snap){
          var value = snap.val();
          if (value) {
            var arrData = this.Data.objectToArray(snap.val());
            this.set('datosLista', arrData);
          }
          resolve('Datos encontrados');
        }.bind(this), function(err){
          console.log(err);
          resolve({error: err});
        });
      }

    }.bind(this));

    return promiseDatos;
  }

});

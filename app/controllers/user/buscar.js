import Ember from 'ember';

export default Ember.Controller.extend({

  loading: false,
  paginasGastos: '',
  paginasIngresos: '',
  itemsPerPage: 10,
  currentPage: 1,
  currentTotal: 1,
  showBack: false,
  showForward: true,
  gastos: true,
  datosCompletos: '',
  datosLista: '',

  init: function(){
      this.set('loading', true);

      Ember.RSVP.allSettled([this._getPages(), this._getDatos()]).then(function(data){
        this.set('loading', false);
      }.bind(this), function(err){

      }.bind(this));

  },

  observePage: Ember.on('init', Ember.observer('currentPage', 'currentTotal', 'datosCompletos', function(){
    var perPage = this.get('itemsPerPage');
    var total = this.get('currentTotal');
    var page = this.get('currentPage');
    var cutList = this.get('datosCompletos');
    cutList = cutList.slice((page-1)*perPage, page*perPage);
    this.set('datosLista', cutList);
    if(total <= 1){
      this.set('currentPage', 1);
      this.set('showBack', false);
      this.set('showForward', false);
    }else{
      if(page !== total){
        this.set('showForward', true);
      } else if (page === total){
        this.set('showForward', false);
      }
      if(page > 1){
        this.set('showBack', true);
      }else{
        this.set('showBack', false);
      }
    }

  })),

  observeType: Ember.observer('gastos', function(){
    this._getDatos();
    this._getPages();
  }),

  _getPages: function () {
    var promisePages = new Promise (function(resolve){
      this.Data.get('userRef')
          .child('datos')
          .child('stats')
          .on('value', function(snap){
            var values = snap.val();
            if(values && values.numGastos > 0 && this.get('gastos')){
              var tempNum = values.numGastos / this.get('itemsPerPage');
              tempNum = Math.ceil(tempNum);

              // Setup visual pagination variables
              this.set('currentTotal', tempNum);
              this.set('currentPage', 1);

              var tempPaginas = [];
              while(tempNum > 0){
                var pageObj = {
                  page : tempNum,
                  state: false,
                };
                if(tempNum === 1){
                  pageObj.state = true;
                  tempPaginas.splice(0, 0, pageObj);
                }else{
                  tempPaginas.splice(0, 0, pageObj);
                }

                tempNum -= 1;
              }
              this.set('paginasGastos', tempPaginas);
              resolve('Existed páginas de gastos');
            }else if(this.get('gastos')){
              this.set('paginasGastos', [0]);
              this.set('datosLista', []);
              resolve('No existen gastos');
            }

            if(values && values.numIngresos > 0 && !this.get('gastos')){
              var tempNum = values.numIngresos / this.get('itemsPerPage');
              tempNum = Math.ceil(tempNum);

              // Setup visual pagination variables
              this.set('currentTotal', tempNum);
              this.set('currentPage', 1);

              var tempPaginas = [];
              while(tempNum > 0){
                var pageObj = {
                  page : tempNum,
                  state: false,
                };
                if(tempNum === 1){
                  pageObj.state = true;
                  tempPaginas.splice(0, 0, pageObj);
                }else{
                  tempPaginas.splice(0, 0, pageObj);
                }

                tempNum -= 1;
              }
              this.set('paginasIngresos', tempPaginas);
              resolve('Existed páginas de gastos');
            }else{
              this.set('paginasIngresos', [0]);
              this.set('datosLista', []);
              resolve('No existen ingresos');
            }
          }.bind(this));
    }.bind(this));
    return promisePages;
  },

  _getDatos: function(){
    var promiseDatos = new Promise(function(resolve){
      if(this.get('gastos')){

        var tempDate = new Date();
        var millis = tempDate.getTime() - (30*24*60*60*1000);

        this.Data.get('userRef').child('datos').child('gastos').orderByChild("fecha").startAt(millis).on('value', function(snap){
          var value = snap.val();
          if (value) {
            var arrData = this.Data.objectToArray(snap.val());
            arrData.sort(function(a, b){
              return b.fecha-a.fecha;
            });
            for (var i = 0; i < arrData.length; i++) {
              var date = new Date(arrData[i].fecha);
              var tempString = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + (date.getDate());
              arrData[i].fecha = tempString;
            }
            this.set('datosCompletos', arrData);
          }else{
            this.set('datosCompletos', []);
          }
          resolve('Datos encontrados');
        }.bind(this), function(err){
          (err);
          resolve({error: err});
        });
      }else{
        this.Data.get('userRef').child('datos').child('ingresos').on('value', function(snap){
          var value = snap.val();
          if (value) {
            var arrData = this.Data.objectToArray(snap.val());
            arrData.sort(function(a, b){
              return b.fecha-a.fecha;
            });
            for (var i = 0; i < arrData.length; i++) {
              var date = new Date(arrData[i].fecha);
              var tempString = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + (date.getDate());
              arrData[i].fecha = tempString;
            }
            this.set('datosCompletos', arrData);
          }else{
            this.set('datosCompletos', []);
          }
          resolve('Datos encontrados');
        }.bind(this), function(err){
          (err);
          resolve({error: err});
        });
      }

    }.bind(this));

    return promiseDatos;
  },

  actions: {
    pageDown: function(){

      var page = this.get('currentPage');
      var tempNum = this.get('currentTotal');

      if(this.get('gastos')){
        tempNum = Math.ceil(tempNum);

        var tempPaginas = [];
        while(tempNum > 0){
          var pageObj = {
            page : tempNum,
            state: false,
          };
          if(tempNum === page-1){
            pageObj.state = true;
            tempPaginas.splice(0, 0, pageObj);
          }else{
            tempPaginas.splice(0, 0, pageObj);
          }

          tempNum -= 1;
        }
        this.set('paginasGastos', tempPaginas);
      }else{
        tempNum = Math.ceil(tempNum);

        var tempPaginas = [];
        while(tempNum > 0){
          var pageObj = {
            page : tempNum,
            state: false,
          };
          if(tempNum === page-1){
            pageObj.state = true;
            tempPaginas.splice(0, 0, pageObj);
          }else{
            tempPaginas.splice(0, 0, pageObj);
          }

          tempNum -= 1;
        }
        this.set('paginasIngresos', tempPaginas);
      }
      this.set ('currentPage', page-1);
    },

    pageUp: function(){

      var page = this.get('currentPage');
      var tempNum = this.get('currentTotal');

      if(this.get('gastos')){
        tempNum = Math.ceil(tempNum);

        var tempPaginas = [];
        while(tempNum > 0){
          var pageObj = {
            page : tempNum,
            state: false,
          };
          if(tempNum === page+1){
            pageObj.state = true;
            tempPaginas.splice(0, 0, pageObj);
          }else{
            tempPaginas.splice(0, 0, pageObj);
          }

          tempNum -= 1;
        }
        this.set('paginasGastos', tempPaginas);
      }else{
        tempNum = Math.ceil(tempNum);

        var tempPaginas = [];
        while(tempNum > 0){
          var pageObj = {
            page : tempNum,
            state: false,
          };
          if(tempNum === page+1){
            pageObj.state = true;
            tempPaginas.splice(0, 0, pageObj);
          }else{
            tempPaginas.splice(0, 0, pageObj);
          }

          tempNum -= 1;
        }
        this.set('paginasIngresos', tempPaginas);
      }
      this.set ('currentPage', page+1);
    },


    toggleType: function(type){
      if(type === 'gasto'){
        this.set('gastos', true);
      }else{
        this.set('gastos', false);
      }
    }
  }

});

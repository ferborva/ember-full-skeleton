import Ember from 'ember';

export default Ember.Controller.extend({

  configValues: '',
  tempCat: '',
  tempSist: '',

  init: function(){

    this.Data.get('userRef').child('config').on('value', function(snap){
      var catArrData = this.Data.objectToArray(snap.val().categorias);
      var sistArrData = this.Data.objectToArray(snap.val().sistemas);
      var data = snap.val();
      data.categorias = catArrData;
      data.sistemas = sistArrData;
      this.set('configValues', data);
      return true;
    }.bind(this), function(err){
      console.log(err);
      return false;
    }.bind(this));
  },

  actions: {
    borrarCategoria: function(categoria){
      var viejoSet = this.get('configValues.categorias');
      var position = viejoSet.indexOf(categoria);
      this.Data.get('userRef').child('config').child('categorias').child(categoria.key).set(null);
    },

    nuevaCategoria: function(){
      var nueva = this.get('tempCat');
      var nuevoSet = this.get('configValues.categorias');
      this.Data.get('userRef').child('config').child('categorias').push({name: nueva});

      this.set('tempCat', '');
    },

    borrarSistema: function(sistema){
      var viejoSet = this.get('configValues.sistemas');
      var position = viejoSet.indexOf(sistema);
      this.Data.get('userRef').child('config').child('sistemas').child(sistema.key).set(null);
    },

    nuevaCategoria: function(){
      var nueva = this.get('tempSist');
      var nuevoSet = this.get('configValues.sistemas');
      this.Data.get('userRef').child('config').child('sistemas').push({name: nueva});

      this.set('tempSist', '');
    }
  }

});

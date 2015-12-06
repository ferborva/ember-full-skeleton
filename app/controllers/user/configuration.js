import Ember from 'ember';

export default Ember.Controller.extend({

  configValues: '',
  tempCat: '',

  init: function(){

    this.Data.get('userRef').child('config').on('value', function(snap){
      if(!snap.val()){
        this.Data.minConfigCategorias();
      }
      var arrData = this.Data.objectToArray(snap.val().categorias);
      var data = snap.val();
      data.categorias = arrData;
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
      var position = nuevoSet.length;
      this.Data.get('userRef').child('config').child('categorias').push({name: nueva});

      this.set('tempCat', '');
    }
  }

});

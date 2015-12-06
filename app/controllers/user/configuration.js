import Ember from 'ember';

export default Ember.Controller.extend({

  configValues: '',
  tempCat: '',

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

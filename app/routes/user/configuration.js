import Base from './../base';

export default Base.extend({

  auth: true,

  model: function(){

    this.Data.get('userRef').child('config').on('value', function(snap){
      if(!snap.val()){
        this.Data.minConfigCategorias();
      }
      var arrData = this.Data.objectToArray(snap.val().categorias);
      var data = snap.val();
      data.categorias = arrData;
      this.controller.set('configValues', data);
      return true;
    }.bind(this), function(err){
      console.log(err);
      return false;
    }.bind(this));
  }

});

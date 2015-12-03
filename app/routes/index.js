import Base from './base';

export default Base.extend({

  actions: {

    focus: function(id, animation, speed){
      id = '#' + id;
      this.Animate.go(id,animation,speed);
    }

  }

});

import Base from './base';

export default Base.extend({

  auth: true,

  actions: {

    focus: function(id, animation, speed){
      id = '#' + id;
      this.Animate.go(id,animation,speed);
    }

  }

});

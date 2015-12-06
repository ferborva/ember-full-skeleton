import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('unknown', { path: "*path"});
  this.route('login');
  this.route('admin');

  this.route('user', function() {
    this.route('dashboard');

    this.route('gastos', function() {
      this.route('nuevo');
    });
    this.route('configuration');
  });
});

export default Router;

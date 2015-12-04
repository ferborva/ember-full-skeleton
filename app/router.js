import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('unknown', { path: "*path"});
  this.route('login');
  this.route('admin');
});

export default Router;

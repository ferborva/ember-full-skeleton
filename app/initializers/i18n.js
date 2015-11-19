export function initialize(/* container, application */) {
  // application.inject('route', 'foo', 'service:foo');
}

export default {
  name: 'i18n',

  after: 'ember-i18n',

  initialize: function(_, app) {
    app.inject('model', 'i18n', 'service:i18n');
    app.inject('route', 'i18n', 'service:i18n');
    app.inject('controller', 'i18n', 'service:i18n');
  }
};
 

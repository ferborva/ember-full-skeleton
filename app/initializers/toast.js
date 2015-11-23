export function initialize( container, application ) {
  application.inject('route', 'toast', 'service:toast');
  application.inject('controller', 'toast', 'service:toast');
  application.inject('service:datapoint', 'toast', 'service:toast');
}

export default {
  name: 'toast',
  initialize: initialize
};

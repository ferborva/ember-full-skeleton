export function initialize( container, application ) {
  application.inject('route', 'Toast', 'service:toast');
  application.inject('controller', 'Toast', 'service:toast');
  application.inject('service:datapoint', 'Toast', 'service:toast');
}

export default {
  name: 'toast',
  initialize: initialize
};

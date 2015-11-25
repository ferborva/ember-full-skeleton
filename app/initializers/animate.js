export function initialize( container, application ) {
  application.inject('route', 'Animate', 'service:animate');
  application.inject('controller', 'Animate', 'service:animate');
  application.inject('service:datapoint', 'Animate', 'service:animate');
}
export default {
  name: 'animate',
  initialize: initialize
};

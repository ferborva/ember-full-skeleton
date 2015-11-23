export function initialize(container, application) {
  application.inject('route', 'Data', 'service:datapoint');
  application.inject('controller', 'Data', 'service:datapoint');
  application.inject('model', 'Data', 'service:datapoint');
}

export default {
  name: 'datapoint',
  after: ['toast', 'i18n'],
  initialize: initialize
};

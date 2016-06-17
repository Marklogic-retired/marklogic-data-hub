(function () {

  'use strict';

  angular.module('tracing')
    .service('tracingService', TracingService);

  function TracingService($http) {
    return {
      enableTracing: enableTracing,
      disableTracing: disableTracing,
      isEnabled: isEnabled
    };

    function enableTracing() {
      return $http.post('/api/tracing/enable');
    }

    function disableTracing() {
      return $http.post('/api/tracing/disable');
    }

    function isEnabled() {
      return $http.get('/api/tracing/is-enabled');
    }
  }

})();

(function () {

  'use strict';

  var dependencies = [
    'ngRoute',
    'dhib.quickstart.controller.login',
    'dhib.quickstart.controller.top',
    'dhib.quickstart.controller.api.doc',
    'dhib.quickstart.directives.header',
    'dhib.quickstart.directives.footer',
    'dhib.quickstart.directives.spinner',
    'dhib.quickstart.directives.notification',
    'angularBootstrapNavTree',
    'ngAnimate',
    'ui.bootstrap',
    'angular-confirm',
    'ngSanitize',
    'swaggerUi',
    'mlcp'
  ];
  angular.module('quickStartApp', dependencies)
    .factory('$exceptionHandler', ExceptionHandler)
    .config(Config)
    .service('Access', AccessService)
    .factory('httpInterceptor', HttpInterceptor)
    .run(RunFunc);

  function ExceptionHandler() {
    return function (exception, cause) {
      exception.message += ' (caused by "' + cause + '")';
      throw exception;
    };
  }

  var dateTimeRegex = /^(\d{4})\-(\d{2})-(\d{2})\s((\d{2}):(\d{2}):(\d{2}))?$/;
  function convertDateStringsToDates(object) {
    if (typeof object !== 'object') {
      return object;
    }

    for (var key in object) {
      if (!object.hasOwnProperty(key)) {
        continue;
      }

      var value = object[key];
      var match;
      // Check for string properties which look like dates.
      if (typeof value === 'string' && (match = value.match(dateTimeRegex))) {
        var year = match[1];
        var month = match[2];
        var day = match[3];
        var hour = 0;
        var min = 0;
        var sec = 0;

        if (match.length > 4) {
          hour = match[5];
          min = match[6];
          sec = match[7];
        }

        object[key] = new Date(year, month - 1, day, hour, min, sec);
      } else if (typeof value === 'object') {
        // Recurse into object
        convertDateStringsToDates(value);
      }
    }
  }

  function Config($httpProvider, $routeProvider) {
    // transform date strings to Date objects from JSON responses
    $httpProvider.defaults.transformResponse.push(function(responseData){
      convertDateStringsToDates(responseData);
      return responseData;
    });

    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }

    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get.Pragma = 'no-cache';

    $routeProvider
    .when('/login', {
      templateUrl: 'login/login.html',
      controller: 'loginController'
    })
    .when('/top', {
      templateUrl: 'top/top.html',
      controller: 'topController',
      resolve: {
        loginStatus: ['Access', function (Access) {
          return Access.isUserLoggedIn();
        }]
      }
    })
    .when('/dismiss', {
      //do nothing
    })
    .when('/api-doc', {
      templateUrl: 'doc/apiDoc.html',
      controller: 'apiDocController'
    })
    .otherwise({
      redirectTo: '/login'
    });
  }

  function AccessService($q, DataHub) {
    var self = this;

    angular.extend(self, {
      OK: 200,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      isUserLoggedIn: isUserLoggedIn
    });

    function isUserLoggedIn() {
      var deferred = $q.defer();

      DataHub.getLoginStatus().then(function (request) {
        if (DataHub.status !== null && !DataHub.status.hasErrors && DataHub.status.loggedIn) {
          deferred.resolve(self.OK);
        }
        else {
          deferred.reject(self.UNAUTHORIZED);
        }
      });

      return deferred.promise;
    }
  }

  function HttpInterceptor($q, toaster) {
    return {
      requestError: function(rejection) {
        return $q.reject(rejection);
      },
      response: function (response) {
        return response;
      },
      responseError: function(rejection) {
        if (rejection.status === 404) {
          // we can intercept HTTP error codes and provide a generic handler here
        }

        return $q.reject(rejection);
      }
    };
  }

  function RunFunc($rootScope, DataHub, $location, $anchorScroll, $templateCache) {
    // redirect to login page if user visits a non-existing page
    $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
      console.log('route change error from: ' + previous + ' to: ' + current + ' rejected: ' + rejection);

      $location.path('/login');
    });

    // don't cache any template
    $rootScope.$on('$routeChangeStart', function(event, next, current) {
      console.log('route change started');

      if (typeof(current) !== 'undefined'){
        $templateCache.remove(current.templateUrl);
      }
    });
  }

})();

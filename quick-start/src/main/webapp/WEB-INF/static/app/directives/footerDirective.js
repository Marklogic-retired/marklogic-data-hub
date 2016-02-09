var dependencies = [
];
var module = angular.module('dhib.quickstart.directives.footer', dependencies);
module.directive('footer', [
    '$http'
    ,'$location'
    ,function(
        $http
        ,$location
    ) {
        return {
            restrict: 'E'
            ,scope : {
                activeTab : '='
            }
            ,transclude: true
            ,templateUrl : function(element, attrs) {
                return attrs.templateUrl || 'app/directives/footer.html';
            }
            ,link : function(scope, element, attrs) {
            }
            ,controller : function($scope, $element, $attrs, $transclude) {
            }
        };
    }
]);
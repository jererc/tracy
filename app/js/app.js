'use strict';

angular.module('tracyApp', ['tracyServices', 'tracyDirectives', 'tracyFilters', 'angularUtils']).
    config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {redirectTo: '/errors'}).
        when('/errors', {templateUrl: 'partials/error-list.html', controller: ErrorListCtrl}).
        when('/tests', {templateUrl: 'partials/test-list.html', controller: TestListCtrl}).
        when('/logs', {templateUrl: 'partials/log-list.html', controller: LogListCtrl}).
        when('/settings', {templateUrl: 'partials/settings-list.html', controller: SettingsListCtrl}).
        otherwise({redirectTo: '/'});
}]);

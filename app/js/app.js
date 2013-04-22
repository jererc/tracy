'use strict';

/* App Module */

angular.module('tracyApp', ['tracyServices', 'tracyDirectives', 'tracyFilters']).
    config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/', {redirectTo: '/errors'}).
        when('/errors', {templateUrl: 'partials/errors-list.html', controller: ErrorsListCtrl}).
        when('/tests', {templateUrl: 'partials/tests-list.html', controller: TestsListCtrl}).
        when('/logs', {templateUrl: 'partials/logs-list.html', controller: LogsListCtrl}).
        when('/settings', {templateUrl: 'partials/settings-list.html', controller: SettingsListCtrl}).
        otherwise({redirectTo: '/'});
}]);

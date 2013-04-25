'use strict';

(function() {

    var services = angular.module('tracyServices', ['ngResource', 'ngCookies']);

    services.service('apiSvc', function($http, $cookieStore) {

        this.getSettingsUrl = function() {
            return $http.get('local_settings.json');
        };

        this.getUrl = function() {
            return $cookieStore.get('tracyApiUrl');
        };

        this.setUrl = function(url) {
            $cookieStore.put('tracyApiUrl', url);
        };

        this.checkUrl = function(url) {
            return $http.get(url + '/status');
        };

        // Errors
        this.listErrors = function() {
            return $http.get(this.getUrl() + '/errors/list');
        };

        this.removeErrors = function(id) {
            return $http.post(this.getUrl() + '/errors/remove',
                {id: id});
        };

        // Tests
        this.listTests = function() {
            return $http.get(this.getUrl() + '/tests/list');
        };

        this.getTestsInfo = function() {
            return $http.get(this.getUrl() + '/tests/info');
        };

        this.resetTests = function() {
            return $http.post(this.getUrl() + '/tests/reset');
        };

        // Logs
        this.listLogs = function() {
            return $http.get(this.getUrl() + '/logs/list');
        };

        this.getLog = function(file) {
            return $http.post(this.getUrl() + '/logs/get',
                {file: file});
        };

        // Settings
        this.listSettings = function() {
            return $http.get(this.getUrl() + '/settings/list');
        };

        this.updateSettings = function(data) {
            return $http.post(this.getUrl() + '/settings/update', data);
        };

    });

})();

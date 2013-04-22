'use strict';

(function() {

    var services = angular.module('tracyServices', ['ngResource', 'ngCookies']);

    //
    // API
    //
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

    //
    // Event
    //
    services.service('eventSvc', function($rootScope) {

        this.emit = function(event, args) {
            $rootScope.$broadcast(event, args);
        };

    });

    //
    // Utils
    //
    services.service('utilsSvc', function() {

        this.mobile = (navigator.userAgent.match(/iPhone|iPod|iPad|Android|WebOS|Blackberry|Symbian|Bada/i) != null);
        this.focus = true;

        var self = this;
        $(window).
            blur(function() {
                self.focus = false;
            }).
            focus(function() {
                self.focus = true;
            });

        this.now = function() {
            return new Date().getTime();
        };

        this.updateUrlQuery = function(url, key, value) {
            var sep = (url.indexOf('?') == -1) ? '?' : '&';
            return url + sep + key + '=' + value;
        };

        this.getIndex = function(value, array) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i] == value) {
                    return i;
                }
            }
            return -1;
        };

        this.updateList = function(src, dst, key, skip, limit) {
            var skip = (skip != undefined) ? skip : 0;
            var limit = (limit != undefined) ? limit : Math.max(src.length, dst.length);
            var key = (key != undefined) ? key : 'id';
            var toRemove = 0;
            var i0;
            for (var i1 = 0; i1 < limit; i1++) {
                i0 = i1 + skip;
                if (src[i0] || dst[i1]) {
                    if (src[i0] && dst[i1]) {
                        if (src[i0][key] == dst[i1][key]) {
                            angular.extend(src[i0], dst[i1])
                        } else {
                            src[i0] = dst[i1];
                        }
                    } else if (!src[i0]) {
                        src.push(dst[i1]);
                    } else if (!dst[i1]) {
                        toRemove++;
                        src[i0] = null;
                    }
                }
            }

            if (toRemove) {
                for (var i = src.length; i--;) {
                    if (src[i] == null) {
                        src.splice(i, 1);
                    }
                }
            }
        };

        this.formatPrimitives = function(data, keys, toObj) {
            for (var key in data) {
                if (angular.isArray(data[key]) && this.getIndex(key, keys) != -1) {
                    var val = angular.copy(data[key]);
                    data[key] = [];
                    val.map(function(v) {
                        var isObj = angular.isObject(v);
                        if (isObj ? v.val : v && isObj != !!toObj) {
                            data[key].push(!!isObj ? v.val : {val: v});
                        }
                    });
                } else if (angular.isObject(data[key])) {
                    this.formatPrimitives(data[key], keys, toObj);
                }
            }
        };

    });

})();

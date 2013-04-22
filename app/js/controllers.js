'use strict';


//
// Main
//
function MainCtrl($rootScope, $scope, $location, apiSvc, eventSvc, utilsSvc) {

    $rootScope.apiStatus = false;

    function _checkApi(url) {
        apiSvc.checkUrl(url).
            error(function() {
                $rootScope.apiStatus = false;
                $location.path('settings');
            }).
            success(function(data) {
                $rootScope.apiStatus = (data.result == 'tracy');
                if ($rootScope.apiStatus) {
                    apiSvc.setUrl(url);
                    eventSvc.emit('getSettings');
                } else {
                    $location.path('settings');
                }
            });
    }

    function checkApi(url) {
        url = url || apiSvc.getUrl();
        if (url) {
            _checkApi(url);
        } else {
            apiSvc.getSettingsUrl().
                success(function(data) {
                    url = data.apiUrl || url;
                    _checkApi(url);
                });
        }
    }

    $rootScope.isMenuActive = function(path) {
        if ($location.path().substr(0, path.length) == path) {
            return 'active';
        }
        return '';
    };

    $rootScope.inArray = function(value, array) {
        if (!array) {
            return -1;
        }
        return utilsSvc.getIndex(value, array) != -1;
    };

    $rootScope.exists = function(val) {
        if (angular.isArray(val)) {
            return !!val.length;
        }
        return !!val;
    };

    $rootScope.$on('checkApi', function(event, args) {
        checkApi((!!args) ? args.url : null);
    });

    checkApi();

}


//
// Errors list
//
function ErrorsListCtrl($rootScope, $scope, $timeout, $location, apiSvc, utilsSvc) {

    $scope.errors = [];

    var active = true;
    var cacheDelta = 10000;
    var updateTimeout;

    function updateErrors(force) {
        $timeout.cancel(updateTimeout);
        if (!active) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateTimeout = $timeout(updateErrors, cacheDelta);
        } else {
            apiSvc.listErrors().
                error(function() {
                    updateTimeout = $timeout(updateErrors, cacheDelta);
                    $location.path('settings');
                }).
                success(function(data) {
                    utilsSvc.updateList($scope.errors, data.result, '_id');
                    updateTimeout = $timeout(updateErrors, cacheDelta);
                });
        }
    }

    $scope.getStatusClass = function(error) {
        switch (!!error.exception) {
            case true:
                return 'label-important';
                break;
            default:
                return 'label-warning';
                break;
        }
    };

    $scope.removeErrors = function(id) {
        apiSvc.removeErrors(id).
            success(function(data) {
                if (data.error) {
                    console.error('failed to remove errors:', data.error);
                }
                updateErrors(true);
            });
    };

    $rootScope.$on('updateErrors', function() {
        updateErrors(true);
    });

    $scope.$on('$destroy', function() {
        active = false;
    });

    updateErrors();

}


//
// Tests list
//
function TestsListCtrl($rootScope, $scope, $timeout, $location, apiSvc, utilsSvc) {

    $scope.tests = [];
    $scope.testsInfo = {};

    var active = true;
    var cacheDelta = 10000;
    var updateTimeout, updateInfoTimeout;

    function updateTests(force) {
        $timeout.cancel(updateTimeout);
        if (!active) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateTimeout = $timeout(updateTests, cacheDelta);
        } else {
            apiSvc.listTests().
                error(function() {
                    updateTimeout = $timeout(updateTests, cacheDelta);
                    $location.path('settings');
                }).
                success(function(data) {
                    utilsSvc.updateList($scope.tests, data.result, '_id');
                    updateTimeout = $timeout(updateTests, cacheDelta);
                });
        }
    }

    function updateTestsInfo(force) {
        $timeout.cancel(updateInfoTimeout);
        if (!active) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateInfoTimeout = $timeout(updateTestsInfo, cacheDelta);
        } else {
            apiSvc.getTestsInfo().
                error(function() {
                    updateInfoTimeout = $timeout(updateTestsInfo, cacheDelta);
                }).
                success(function(data) {
                    $scope.testsInfo = data.result;
                    updateInfoTimeout = $timeout(updateTestsInfo, cacheDelta);
                });
        }
    }

    $scope.getStatusClass = function(test) {
        switch (test.type) {
            case 'failure':
                return 'label-important';
                break;
            default:
                return 'label-warning';
                break;
        }
    };

    $scope.resetTests = function() {
        apiSvc.resetTests().
            success(function(data) {
                if (data.error) {
                    console.error('failed to reset tests:', data.error);
                }
                updateTestsInfo(true);
            });
    };

    $scope.$on('$destroy', function() {
        active = false;
    });

    updateTests();
    updateTestsInfo();

}


//
// Logs list
//
function LogsListCtrl($rootScope, $scope, $timeout, $location, apiSvc, utilsSvc) {

    $scope.logs = [];
    $scope.logFile = null;
    $scope.logData = '';

    var active = true;
    var cacheDelta = 5000;
    var updateTimeout, updateLogTimeout;

    function updateLogs(force) {
        $timeout.cancel(updateTimeout);
        if (!active) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateTimeout = $timeout(updateLogs, cacheDelta);
        } else {
            apiSvc.listLogs().
                error(function() {
                    updateTimeout = $timeout(updateLogs, cacheDelta);
                    $location.path('settings');
                }).
                success(function(data) {
                    utilsSvc.updateList($scope.logs, data.result, 'name');
                    updateTimeout = $timeout(updateLogs, cacheDelta);
                });
        }
    }

    function updateLogData(force) {
        $timeout.cancel(updateLogTimeout);
        if (!active || !$scope.logFile) {
            return false;
        }
        if (!utilsSvc.focus && !force) {
            updateLogTimeout = $timeout(updateLogData, cacheDelta);
        } else {
            apiSvc.getLog($scope.logFile).
                error(function() {
                    $scope.logData = '';
                    updateLogTimeout = $timeout(updateLogData, cacheDelta);
                }).
                success(function(data) {
                    $scope.logData = data.result;
                    updateLogTimeout = $timeout(updateLogData, cacheDelta);
                });
        }
    }

    $scope.getLog = function(file) {
        $scope.logFile = (file != $scope.logFile) ? file : '';
        updateLogData(true);
    };

    $scope.$on('$destroy', function() {
        active = false;
    });

    updateLogs();

}


//
// Settings list
//
function SettingsListCtrl($rootScope, $scope, apiSvc, eventSvc, utilsSvc) {

    $scope.settings = {};

    function getSettings() {
        $scope.apiUrl = apiSvc.getUrl();
        apiSvc.listSettings().
            error(function() {
                $scope.settings = {};
            }).
            success(function(data) {
                $scope.settings = data.result;
                utilsSvc.formatPrimitives($scope.settings,
                        ['tests_files', 'logs_paths'], true);
            });
    }

    $scope.checkApi = function() {
        eventSvc.emit('checkApi', {url: $scope.apiUrl});
    };

    $scope.updateSettings = function() {
        utilsSvc.formatPrimitives($scope.settings,
                ['tests_files', 'logs_paths']);

        apiSvc.updateSettings($scope.settings).
            success(function(data) {
                if (data.error) {
                    console.error('failed to update settings:', data.error);
                }
                getSettings();
            });
    };

    $scope.$on('getSettings', getSettings);

    $scope.checkApi();

}

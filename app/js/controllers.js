'use strict';


//
// Main
//
function MainCtrl($rootScope, $scope, $location, rootScopeSvc, apiSvc, eventSvc, utilsSvc) {

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

    $rootScope.$on('checkApi', function(event, args) {
        checkApi((!!args) ? args.url : null);
    });

    checkApi();

}


//
// Errors list
//
function ErrorListCtrl($rootScope, $scope, $timeout, $location, apiSvc, utilsSvc) {

    $scope.errors = [];

    $scope.statusInfo = {
        true: {name: 'error', labelClass: 'label-warning'},
        false: {name: 'exception', labelClass: 'label-important'},
    };

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

    $scope.removeError = function(id) {
        apiSvc.removeError(id).
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
function TestListCtrl($rootScope, $scope, $timeout, $location, apiSvc, utilsSvc) {

    $scope.tests = [];
    $scope.testsInfo = {};

    $scope.statusInfo = {
        true: {labelClass: 'label-warning'},
        false: {labelClass: 'label-important'},
    };

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
function LogListCtrl($rootScope, $scope, $timeout, $location, apiSvc, utilsSvc) {

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

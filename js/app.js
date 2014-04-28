/*
 * Angular JS app
 */

window.app = angular.module('app', ['ngRoute'])

    .config(function($routeProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $routeProvider
            .when('/', {
                controller: 'homeCtrl',
                templateUrl: 'home.html'
            });

    })

    .controller('homeCtrl', function($scope, $interval) {

        var currMillis = function() {
            return new Date().getMilliseconds();
        }

        var millis = function(dt) {
            var ms = dt.getMilliseconds();
            var centi = Math.round(ms / 10);

            return 100 == centi ? 0 : centi;
        };

        var pad = function(num) {
            var str = String(num);

            switch (str.length) {
            case 0:
                return '00';
            case 1:
                return '0' + str;
            default:
                return str;
            }
        };

        // time to str
        var timeToStr = function(dt) {
            var min = pad(dt.getMinutes());
            var sec = pad(dt.getSeconds());
            var ms  = pad(millis(dt));
            return min + ':' + sec + '.' + ms;
        };

        // display milliseconds difference as MM:SS.cc
        var diffTime = function(diff) {
            var mil = diff % 1000;
            var cen = Math.round(mil / 10);
            var sec = Math.floor(diff / 1000);
            var min = Math.floor(sec / 60);

            var cc = pad(cen % 100);
            var ss = pad(sec % 60);

            return String(min) + ':' + ss + '.' + cc;
        };

        var timerStart = function() {
            var startTime = new Date();

            $scope.timerPromise = $interval(
                function() {
                    var currTime = new Date();
                    var incremental = currTime - startTime;

                    startTime = currTime;
                    $scope.elapsedTime += incremental;
                    $scope.timeDisplay = diffTime($scope.elapsedTime);
                },
                10
            );
        };

        var timerStop = function() {
            $interval.cancel($scope.timerPromise);
        };

        $scope.elapsedTime = 0;
        $scope.timeDisplay = '00:00.00';

        $scope.state = 'begin';
        $scope.btnLabel = 'Start';

        $scope.startStop = function() {
            if ('begin' == $scope.state) {
                $scope.btnLabel = 'Stop';
                $scope.state = 'running';
                timerStart();
            }
            else if ('running' == $scope.state) {
                $scope.btnLabel = 'Start';
                $scope.state = 'begin';
                timerStop();
            }
        };

    })


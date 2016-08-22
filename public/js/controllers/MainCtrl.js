angular.module('MainCtrl', []).controller('MainController', function($http, $rootScope, $scope, $state, $interval, AuthService, AUTH_EVENTS, API_ENDPOINT) {

	$scope.user = {};

	$scope.alert = null;
	$scope.alert2 = null;
	$scope.requesting = false;
	$scope.currentState = $state;
	$scope.memberInfo = {};

	$scope.memberCatsEmpty = [true, true, true];
	$scope.memberRoles = {};

	var locale = window.navigator.userLanguage || window.navigator.language || window.navigator.browserLanguage || window.navigator.systemLanguage || "en-us";
	var options1 = {weekday: "short", year:"numeric", month:"long", day:"numeric"};
	var options2 = {hour:"numeric", minute:"numeric", second: "numeric", timeZoneName: "short"};
	
	var tick = function() {
		$rootScope.clockDate = ServerDate.toLocaleString(locale, options1);
		$rootScope.clockTime = ServerDate.toLocaleString(locale, options2);
	}
	tick();
	$interval(tick, 100);

	$scope.login = function() {
		AuthService.login($scope.user).then(function(msg) {
			$state.go('main');
		}, function(errMsg) {
			$scope.alert = {msg: errMsg, strong: "Login failed!"};
		});
	};

	$scope.signup = function() {
		if($scope.user.registerRepeatPassword !== $scope.user.registerPassword) {
			$scope.alert2 = {msg: "Passwords do not match.", strong: "Registration failed!"};
			return;
		}
		if(!$scope.requesting) {
			$scope.requesting = true;
		} else {
			AuthService.register($scope.user).then(function(msg) {
				$scope.alert2 = {type: "success", msg: msg, strong: "Registration succeeded!"};
				$scope.requesting = false;
				$scope.user = {};
			}, function(errMsg) {
				$scope.alert2 = {msg: errMsg, strong: "Registration failed!"};
			});
		}
	};

	$scope.logout = function() {
		AuthService.logout(false);
		$state.go('home');
	};

	$scope.closeAlert = function() {
		$scope.alert = null;
	};

	$scope.closeAlert2 = function() {
		$scope.alert2 = null;
	};

	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
		AuthService.logout(true);
		$state.go('home');
	});

	$scope.$watch(function(){
		return AuthService.isUserInfoReady();
	}, function (newValue) {
		if(newValue != null) {
			$scope.memberCatsEmpty = AuthService.getMemberCatsEmpty();
			$scope.memberRoles = AuthService.getMemberRoles();
			$scope.memberInfo = AuthService.getMemberInfo();
			if(AuthService.isFirstLogin()) {
				$state.go('edit-profile');
			}
		}
	}, true);

	if(AuthService.getTokenTimeout()) {
		AuthService.setTokenTimeout(false);
		//$scope.alert = {type: "warning", msg: "Please login again.", strong: "Session timed out!"};
	}
});
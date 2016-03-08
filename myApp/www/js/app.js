// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'angular-momentjs', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, $cordovaDevice) {
  $ionicPlatform.ready(function() {
	 
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
	
	//get device id
	var device_uuid = ionic.Platform.device().uuid;
	console.log('----device_uuid-----',ionic.Platform.device().uuid);
	
	if(device_uuid){
		$rootScope.deviceID = device_uuid;
	}else
	{
		$rootScope.deviceID = 'c00eeoe';
	}
	
	
	$rootScope.serverAddress = '192.168.1.3:3000';
	
	
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })
  
  
  // Each tab has its own nav history stack:
  
  

  .state('tab.simulator', {
    url: '/simulator',
    views: {
      'tab-simulator': {
        templateUrl: 'templates/simulator.html',
        controller: 'simulatorCtrl'
      }
    }
  })

  .state('tab.dashboard', {
      url: '/dashboard',
      views: {
        'tab-dashboard': {
          templateUrl: 'templates/dashboard.html',
          controller: 'dashboardCtrl'
        }
      }
    })
	
	
    .state('tab.dashboard-detail', {
      url: '/dashboard/:chatId',
      views: {
        'tab-dashboard': {
          templateUrl: 'templates/dash-detail.html',
          controller: 'dashDetailCtrl'
        }
      }
    })

 

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/simulator');
  
});

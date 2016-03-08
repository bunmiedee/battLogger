angular.module('starter.controllers', ['starter.services'])



.controller('simulatorCtrl', function($rootScope, $scope, logBattEvent, Offline, resetlogEvents) {
	$scope.evt = {};
	var evts;
	
	$scope.generateList = function (count){
		//generate low batt events for number of entries
			
			evts = [];
			var _param;
			
			var today = moment().startOf('day');
		 
			var yesterday = moment(today).add(-1, 'days');
			var lim;
			
			if($scope.evt.previousDay == true){
				_param = yesterday;
				lim = 82801;
			}else
			{
				var currTime = moment(); 
				_param = today;
				var duration = moment.duration(currTime.diff(today));
				lim = duration.asSeconds();
				
				//console.log('limmm-----', lim);
			
			}
			
			
			
			for(var i = 0; i < $scope.evt.entries; i++){
				var _battLvl = $scope.getRandomInt(1,6);
				
				
				//generate random number between 1 & 23hrs01secs or now
				var _randOffset = $scope.getRandomInt(1,lim);
				
				var _now = moment(_param).startOf('day').add(_randOffset, 'seconds');
				var _timeStamp = moment(_now).valueOf();
				
				var logObj = {"deviceID":$rootScope.deviceID, "timeStamp":_timeStamp, "battLevel":_battLvl}
				evts.push(logObj);
				//console.log('--time--', moment(_now).format('dddd, MMMM Do YYYY, h:mm:ss a'));
				
			}
			
			return evts;
		
	}
	
	$scope.updateLog = function (){
		var now;
		
		if($scope.evt.entries > 0){
			
			//generate low batt events for number of entries
			evts = $scope.generateList ($scope.evt.entries);
		}else
		{
			//use a random number for battery level
			now = Date.now();
			$scope.evt.battLvl = $scope.getRandomInt(1,6);
			evts = {"deviceID":$rootScope.deviceID, "timeStamp":now, "battLevel":$scope.evt.battLvl}
		}
		
        console.log('\n---update while device has network access---', moment(now).format('dddd, MMMM Do YYYY, h:mm:ss a'));
		
		logBattEvent.updateLog(evts);
          return logBattEvent.updateLogResponse().then(function(result){
          console.log(result);
		  
		  //might be worth looking at updating app database locally if live update fails
		  if(result.statusText != "OK"){
			  //update went wronng! update local db
			  Offline.updateLog(now, $scope.evt.battLvl);
		  }

        });
		
      }
	  
	  $scope.resetLog = function (){
		
		
        console.log('\n---Reset Node server');
		
		resetlogEvents.resetEvtLog(evts);
          return resetlogEvents.resetLogResponse().then(function(result){
          console.log(result);
		  
        });
		
      }
	  
	  
	  $scope.offlineMode = function (){
		var now;
		
		if($scope.evt.entries > 0){
			
			//generate low batt events for number of entries
			evts = $scope.generateList ($scope.evt.entries);
			Offline.bulkupdateLog(evts);
		}else
		{
			//use a random number for battery level
			now = Date.now();
			$scope.evt.battLvl = $scope.getRandomInt(1,6);
			
			console.log('\n---update while device is out of network reach---');
			Offline.updateLog(now, $scope.evt.battLvl);
		}
		
		  
	  }
	  
	  
	  $scope.backOnline = function (){
		  console.log('\n---update while device is back within network reach after being offline---');
		  Offline.syncLog();
		  
	  }
	  
	  $scope.getRandomInt = function(min, max) {
		  return Math.floor(Math.random() * (max - min + 1)) + min;
	  }

	  
	})

.controller('dashboardCtrl', function($rootScope, $scope, getlogEvents) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  
  $rootScope.summ = {"eventCount":0};
  
  
  $scope.getEvtsLog = function (period){
		console.log('\n-----get events logged----', period);
		
		var today = moment().startOf('day');
		 
		var yesterday = moment(today).add(-1, 'days');
		
		if(period == 'yesterday'){
			$rootScope.summ.day = moment(yesterday).format('dddd, MMM Do YYYY'); 	
		}else
		{
			$rootScope.summ.day = moment(today).format('dddd, MMM Do YYYY');
		}
		
        
		getlogEvents.getLog(period);
          return getlogEvents.getLogResponse().then(function(result){
          //console.log(result.data);
		  var objs = result.data;
		  var evtSum = 0;
		  console.log('----total number of events logged for selected period is---', objs.length);
		  
		  for(var i = 0; i < objs.length; i++){
			  var logObj = objs[i];
			  logObj.tsFormatted = moment(logObj.timeStamp).format('dddd, MMM Do YYYY, h:mm:ss a')
			  evtSum += logObj.battLevel;
		  }
		  
		  var average = evtSum/objs.length;
		  
		  console.log('----Average battery level received for selected period is---', average);
		  
		  $scope.summ.eventCount = objs.length;
		  $scope.summ.average = average.toFixed(2);
		  $rootScope.logs = objs;
		  
        });
		
      }
	  
	  $scope.getEvtsLog('today');
  
})

.controller('dashDetailCtrl', function($scope, $rootScope) {
  $scope.logs = $rootScope.logs;
});
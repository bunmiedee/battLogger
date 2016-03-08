angular.module('starter.services', [])

.service('logBattEvent', function updateBattLogFactory($http, $rootScope){

    this.promise = {};

    this.updateLog = function(logObj) {
        
		this.promise = $http({
            url: 'http://'+  $rootScope.serverAddress +'/logEvent',
            method: 'POST',
            data: logObj

        })
    }

    this.updateLogResponse = function() {
        return this.promise;
    };
})

.service('synclogEvents', function syncBattLogFactory($http, $rootScope){

    this.promise = {};

    this.syncLog = function(syncData) {
        
		this.promise = $http({
            url: 'http://'+  $rootScope.serverAddress +'/logEvent',
            method: 'POST',
            data: syncData

        })
    }

    this.syncLogResponse = function() {
        return this.promise;
    };
})


.service('getlogEvents', function getBattLogFactory($http, $rootScope){

    this.promise = {};

    this.getLog = function(period) {
        
		this.promise = $http({
            url: 'http://'+  $rootScope.serverAddress +'/battEventSumm',
            method: 'POST',
            data: {"period":period}

        })
    }

    this.getLogResponse = function() {
        return this.promise;
    };
})

.service('resetlogEvents', function resetLogFactory($http, $rootScope){

    this.promise = {};

    this.resetEvtLog = function() {
        
		this.promise = $http({
            url: 'http://'+  $rootScope.serverAddress +'/resetLog',
            method: 'GET'

        })
    }

    this.resetLogResponse = function() {
        return this.promise;
    };
})


.factory('Offline', function(synclogEvents, $rootScope) {
	console.log('----offline & db---');
	
	//set db properties
	var shortName = 'B2M_logger',
		version = '1.0',
		displayName = 'Batt Logger',
		maxSize = 100000; // in bytes
	
	var B2M_logger;
	
	var errorHandler = function( transaction, error ) {
	    
		 	if (error.code===1){
		 		// DB Table already exists
		 	} else {
		    	
				console.log('Oops.  Error was '+error.message+' (Code '+ error.code +')');
		 	}
		    return false;		    
	    },
	    
	    nullDataHandler = function() {
		    console.log("SQL Query Succeeded");
	    };
		
		
		try {
			    if (!window.openDatabase) {
			        alert('Local Databases are not supported by your browser. Please use a Webkit browser for this demo');
			    } else {
					
			        	B2M_logger = openDatabase(shortName, version, displayName, maxSize);
					
			    }
			} catch(e) {
			    if (e === 2) {
			        // Version mismatch.
			        console.log("Invalid database version.");
			    } else {
			        console.log("Unknown error "+ e +".");
			    }
			    return;
			} 

  
  return {
	updateLog: function(timeStamp, battLvl) {
		console.log('----createLogTable----');
		
		if(!B2M_logger) {
			//db isnt connected
			return;
		}
				
		B2M_logger.transaction(
			function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS Event_Log(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, timeStamp INTEGER NOT NULL UNIQUE,battLevel NUMERIC NOT NULL);', [],nullDataHandler, errorHandler);
							
							
				transaction.executeSql("INSERT OR IGNORE INTO Event_Log(timeStamp, battLevel) VALUES (?, ?)", [timeStamp, battLvl], nullDataHandler, errorHandler);
				
			});
			
	},
	
	
	bulkupdateLog: function(evts) {
		console.log('----createLogTable----');
		
		if(!B2M_logger) {
			//db isnt connected
			return;
		}
				
		B2M_logger.transaction(
			function (transaction) {
				transaction.executeSql('CREATE TABLE IF NOT EXISTS Event_Log(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, timeStamp INTEGER NOT NULL UNIQUE,battLevel NUMERIC NOT NULL);', [],nullDataHandler, errorHandler);
				for(var i = 0; i < evts.length; i++){
					var obj = evts[i];
					var _timeStamp = evts[i].timeStamp;
					var _battLvl  = evts[i].battLevel;
					
					transaction.executeSql("INSERT OR IGNORE INTO Event_Log(timeStamp, battLevel) VALUES (?, ?)", [_timeStamp, _battLvl], nullDataHandler, errorHandler);
					
				}
							
				
			});
			
	},
	
	
		
		
	
	
    syncLog : function() {
	  
	  	if(!B2M_logger) {
			//db isnt connected
			return;
		}
		
		 B2M_logger.transaction(
	  		function (transaction) {
				transaction.executeSql('SELECT * from Event_Log', [], _dataHandler, errorHandler);
				
			});
			
		_dataHandler = function(transaction, results) {
			//dbquery results
			console.log('\n---dbquery results', results, results.rows.length, results.rows);
			
			if(results.rows.length > 0){
				//sync offline data with live db
				var syncData = [];
				
				for (var i=0; i<results.rows.length; i++) {
					var row = results.rows.item(i);
					//console.log('row check***', row);
					
					//avoid id conflict on db
					delete row.id;
					row.deviceID = $rootScope.deviceID;
					syncData.push(row);
				}
				
				//console.log('\n---syncData---', syncData);
				
				synclogEvents.syncLog(syncData);
				  return synclogEvents.syncLogResponse().then(function(result){
				  console.log(result);
				  
				  if(result.data.BulkUpdate == true){
					//offline data has been successfully synced and its okay to delete table 
					
					 B2M_logger.transaction(
						function (transaction) {
							transaction.executeSql("DROP TABLE Event_Log", [], nullDataHandler, errorHandler);
							
						});
				  }
		
				});
								
			}
		};
    }
	
	
  }
  
});
angular.module("realtimeWatcherApp",['treeControl'])
.constant("baseUrl","http://localhost:3000")
.factory('socket', function ($rootScope) {
    var socket = io.connect();
    return {
      on: function (eventName, callback) {
        socket.on(eventName, function () {  
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(socket, args);
            }
          });
        })
      }
    };
})
.service("FileService",function($http,$q,baseUrl){

    this.getDirectoryContents = function(){
        var defer = $q.defer();
        $http.get(baseUrl+"/getDirectoryTree")
        .then(function(response){
            if(!response.data.error){
                defer.resolve(response.data);
            }else{
                defer.reject(response.data.error);
            }
        })
        return defer.promise;
    }

    this.getCurrentFileContents = function(filePath){
        var defer = $q.defer();
        $http.post(baseUrl+"/file/getContents",angular.copy({"filePath" : filePath}))
        .then(function(response){
            if(!response.data.error){
                defer.resolve(response.data);
            }else{
                defer.reject(response.data.error);
            }
        })
        return defer.promise;
    }
})
.controller("mainCtrl",function($scope,FileService,socket){
    
    $scope.data = [];
    $scope.shownFileContent = "";

    $scope.treeOptions = {
        nodeChildren: "children",
        dirSelectable: false,
        injectClasses: {
            ul: "a1",
            li: "a2",
            liSelected: "a7",
            iExpanded: "a3",
            iCollapsed: "a4",
            iLeaf: "a5",
            label: "a6",
            labelSelected: "a8"
        }
    }

    FileService.getDirectoryContents()
    .then(function(data){
        $scope.data = [data];
    }).catch(function(err){
        console.error(err);
    });

    $scope.showSelectedFile = function(node){
        console.log("node selected = ",node);
        socket.emit("startFileWatch",node);
    }

    socket.on("newFileChanges",function(data){
        console.log("newData = ",data);
        $scope.shownFileContent += data; 
    });

    socket.on("fileWatchError",function(err){
        console.log("error = ",err);
    })

});
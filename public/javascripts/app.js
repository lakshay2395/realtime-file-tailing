angular.module("realtimeWatcherApp",['treeControl'])
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
.service("FileService",function($http,$q){

    this.getDirectoryContents = function(){
        var defer = $q.defer();
        $http.get("getDirectoryTree")
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
    $scope.selectedNode = null;

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
        $scope.shownFileContent = "";
        $scope.selectedNode = node;
        socket.emit("startFileWatch",node);
    }

    socket.on("newFileChanges",function(data){
        $scope.shownFileContent += data; 
        $(document).ready(function(){
            var $id = $("#downScrolledDiv");
            $id.scrollTop($id[0].scrollHeight);
        })
    });

    socket.on("fileWatchError",function(err){
        console.log("error = ",err);
        window.alert(err);
    })

});
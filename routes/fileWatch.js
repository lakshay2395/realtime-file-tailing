const directoryReader = require("../utils/directoryReader");
const process = require("process");

const directory = "/home/ec2-user/realtime-file-tailing/public"; 

module.exports = function(io){

  var express = require('express');
  var router = express.Router();
  var ts = require('tail-stream');
    
  router.get("/getDirectoryTree",function(req,res){
      console.log("directory = ",directory);
      var data = directoryReader.walkDirectory(directory);
      console.log("data = ",data);
      return res.json(directoryReader.walkDirectory(directory));
  });

  io.on("connection",(socket) => {
      socket.on("startFileWatch",(data) => {
    
          var tstream = ts.createReadStream(data.value, {
              beginAt: 0,
              onMove: 'follow',
              detectTruncate: true,
              onTruncate: 'end',
              endOnError: false
          });
          
          tstream.on('data', function(data) {
            socket.emit("newFileChanges",data.toString());
          });
          
          tstream.on('error', function(err) {
              console.log("error: " + err); 
              socket.emit("fileWatchError",err);
          });
      });

  });

  return router;
};

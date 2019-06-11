const fs = require("fs");
const path = require("path");

function walkDirectory(dir){
    let dirName = dir.split(path.sep).pop();
    var results = {
        "name" : dirName,
        "value" : dir,
        "children" : []
    }
    console.log("dir = ",dir);
    var list = fs.readdirSync(dir);
    if(list.length > 0){
        list.forEach((file) => {
            filePath = path.resolve(dir, file);
            let stat = fs.lstatSync(filePath)
            if (stat.isFile()) {
                results.children.push({
                    "name" : file,
                    "value" : filePath
                });
            } else {
                results.children.push(walkDirectory(filePath));
            }
        });
    }
    return results;
}

module.exports = {
    "walkDirectory" : walkDirectory
}
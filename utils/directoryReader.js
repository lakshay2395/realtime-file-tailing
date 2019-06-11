const fs = require("fs");
const path = require("path");

function walkDirectory(dir){
    let dirName = dir.split(path.sep).pop();
    var results = {
        "name" : dirName,
        "value" : dir,
        "children" : []
    }
    var list = fs.readdirSync(dir);
    if(list.length > 0){
        list.forEach((file) => {
            if(file == "node_modules" || file == ".git" || file == ".gitignore")
                return;
            filePath = path.resolve(dir, file);
            let stat = fs.lstatSync(filePath)
            if (stat.isFile()) {
                // console.log("file = ",filePath)
                results.children.push({
                    "name" : file,
                    "value" : filePath
                });
            } else {
                // console.log("directory = ",filePath)
                results.children.push(walkDirectory(filePath));
            }
        });
    }
    console.log("results = ",results);
    return results;
}

module.exports = {
    "walkDirectory" : walkDirectory
}
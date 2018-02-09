module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllPhotosByType:function(req,res){
        console.log("body",req.body);
        if(req.body && req.body.folderType){
            Gallery.getAllPhotosByType(req.body,res.callback)
        }else{
            res,json({
                data:"Insufficient Data",
                value:false
            });
        }
    },

    getAllPhotosByFolder:function(req,res){
        if(req.body && req.body.folderType && req.body.folderName){
            Gallery.getAllPhotosByFolder(req.body,res.callback);
        }else{
            res.json({
                data:"Insuficient Data",
                value:false
            });
        }
    }

};
module.exports = _.assign(module.exports, controller);

module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    uploadExcel: function (req, res) {
        if (req.body.file) {
            Config.importGS(req.body.file, function (err, importData) {
                if (err || _.isEmpty(importData)) {
                    res.json({
                        data: err,
                        value: false
                    });
                } else {
                    Media.uploadExcel(importData, res.callback);
                }
            });
        } else {
            res.json({
                data: "File Not Found",
                value: false
            });
        }



    },

    generateExcel: function (req, res) {
        Media.generateExcel(req.query, res);
    },

    getFolders: function (req, res) {
        if (req.body && req.body.mediatype) {
            Media.getFolders(req.body, res.callback);
        } else {
            res.json({
                data:"Insufficient Data",
                value:false
            });
        }
    },

    getMedias: function (req, res) {
        if (req.body && req.body.mediatype && req.body.folder && req.body.year) {
            Media.getMedias(req.body, res.callback);
        } else {
            res.json({
                data:"Insufficient Data",
                value:false
            });
        }
    },

    getAllVideos:function(req,res){
        Media.getAllVideos(res.callback);
    },

    getAllVideosByFolder:function(req,res){
        console.log(req.body);
        if(req.body && req.body.folder){
            Media.getAllVideosByFolder(req.body,res.callback);        
        }else{
            res.json({
                data:"Insufficient Data",
                value:false
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);
module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    uploadExcel: function (req, res) {
        if(req.body.file){
            Config.importGS(req.body.file, function (err, importData) {
                    if (err || _.isEmpty(importData)) {
                        res.json({
                            data:err,
                            value:false
                        });
                    } else {
                        Media.uploadExcel(importData,res.callback);
                    }
                });
        }else{
            res.json({
                data:"File Not Found",
                value:false
            });
        }
                
          

    },

    generateExcel: function (req, res) {
        Media.generateExcel(req.query,res);
    }
};
module.exports = _.assign(module.exports, controller);
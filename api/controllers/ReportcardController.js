module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    generateReportCard:function (req,res){
        res.connection.setTimeout(200000000);
        req.connection.setTimeout(200000000);
        Reportcard.generateReportCard(res.callback);
    },

    tp:function(req,res){
        Reportcard.tp(res.callback);
    }

};
module.exports = _.assign(module.exports, controller);

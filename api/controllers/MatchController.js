module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    tp:function(req,res){
        console.log(req.data);
    }
};
module.exports = _.assign(module.exports, controller);

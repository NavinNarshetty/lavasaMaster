module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getSchoolByRanks:function(req,res){
        Rank.getSchoolByRanks(res.callback);
    }
};
module.exports = _.assign(module.exports, controller);

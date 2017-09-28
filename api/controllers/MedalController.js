module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    saveMedal: function (req, res) {
        if (req.body) {
            if (req.body && req.body.sportslist && req.body.gender && req.body.ageGroup) {
                var matchObj = {
                    sportslist: req.body.sportslist,
                    gender: req.body.gender,
                    ageGroup: req.body.ageGroup,
                    team:req.body.team,
                    player:req.body.player,
                    school:req.body.school
                }
                if (!_.isEmpty(req.body.weight)) {
                    matchObj.weight = req.body.weight;
                }
                Medal.saveMedal(matchObj, res.callback);
            } else {
                res.json({
                    data: "Some Fields are Missing",
                    value: false
                });
            }
        } else {
            res.json({
                data: "Body Not Found",
                value: false
            });
        }
    }
};
module.exports = _.assign(module.exports, controller);
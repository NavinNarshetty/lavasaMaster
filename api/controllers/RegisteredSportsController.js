module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAllRegisteredSport: function (req, res) {
        if (req.body.schoolToken) {
            Registration.findOne({
                accessToken: req.body.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "Incorrect Login Details"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "Incorrect Login Details"
                    });
                } else {
                    req.body.school = found._id;
                    req.body.schoolName = found.schoolName;
                    RegisteredSports.getAllRegisteredSport(req.body, res.callback);
                }
            });
        } else if (req.body.athleteToken) {
            Athelete.findOne({
                accessToken: req.body.athleteToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "Incorrect Login Details"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "Incorrect Login Details"
                    });
                } else {
                    req.body.athleteid = found._id;
                    RegisteredSports.getAllRegisteredSportAthlete(req.body, res.callback);
                }
            });
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },

    getDetailRegisteredAthlete: function (req, res) {
        if (req.body.type == "Team") {
            RegisteredSports.getDetails(req.body, res.callback);
        } else if (req.body.type == "Individual") {
            RegisteredSports.getDetails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "User Not logged in"
            });
        }
    },

};
module.exports = _.assign(module.exports, controller);
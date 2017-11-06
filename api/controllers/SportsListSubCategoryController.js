module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    getAll: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getAll(res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getAllSport: function (req, res) {
        if (req) {
            SportsListSubCategory.getAllSport(res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneSport: function (req, res) {
        if (req.body.schoolToken) {
            Registration.findOne({
                accessToken: req.body.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "Something went wrong !"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "No User Found"
                    });
                } else {
                    req.body.school = found._id;
                    req.body.schoolName = found.schoolName;
                    SportsListSubCategory.getOneSport(req.body, res.callback);
                }
            });
        } else if (req.body.athleteToken) {
            SportsListSubCategory.getSchoolPerAthlete(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    editOneSport: function (req, res) {
        if (req.body.schoolToken) {
            Registration.findOne({
                accessToken: req.body.schoolToken
            }).exec(function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        data: "Something went wrong !"
                    });
                } else if (_.isEmpty(found)) {
                    res.json({
                        value: false,
                        data: "No User Found"
                    });
                } else {
                    req.body.school = found._id;
                    req.body.schoolName = found.schoolName;
                    SportsListSubCategory.editOneSport(req.body, res.callback);
                }
            });
        } else if (req.body.athleteToken) {
            SportsListSubCategory.editSchoolPerAthlete(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getSports: function (req, res) {
        if (req.body.schoolToken) {
            SportsListSubCategory.getSports(req.body, res.callback);
        } else if (req.body.athleteToken) {
            SportsListSubCategory.getSportsAthlete(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },


    getRules: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getRules(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getOneRuleBySportsName: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getOneRuleBySportsName(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getEvents: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getEvents(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getSportType: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getSportType(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getSportsDeails: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getSportsDeails(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },
    getEventSportslistSubCategory: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getEventSportslistSubCategory(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });

        }
    }
};
module.exports = _.assign(module.exports, controller);
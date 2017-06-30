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

    getOneSport: function (req, res) {
        if (req.body) {
            if (req.body.schoolToken) {
                Registration.findOne({
                    accessToken: req.body.schoolToken
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        // req.body.school = found._id;
                        SportsListSubCategory.getOneSport(req.body, res.callback);
                    }
                });
            } else if (req.body.athleteToken) {
                Athelete.findOne({
                    accessToken: req.body.athleteToken
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback("Incorrect Login Details", null);
                    } else {
                        // req.body.school = found._id;
                        SportsListSubCategory.getOneSport(req.body, res.callback);
                    }
                });
            }
        } else {
            res.json({
                value: false,
                data: "Invalid Request"
            });
        }
    },

    getSports: function (req, res) {
        if (req.body) {
            SportsListSubCategory.getSports(req.body, res.callback);
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
    }
};
module.exports = _.assign(module.exports, controller);
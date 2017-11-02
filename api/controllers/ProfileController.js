module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

    searchAthlete: function (req, res) {
        if (req.body) {
            Profile.searchAthlete(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    searchSchool: function (req, res) {
        if (req.body) {
            Profile.searchSchool(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    searchTeam: function (req, res) {
        if (req.body) {
            Profile.searchTeam(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAthleteProfile: function (req, res) {
        if (req.body) {
            async.waterfall([
                    function (callback) {
                        Athelete.findOne({
                            sfaId: "MA16" + data.sfaId
                        }).lean().exec(function (err, athlete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                if (_.isEmpty(athlete)) {
                                    callback(null, []);
                                } else {
                                    callback(null, athlete);
                                }
                            }
                        });
                    },
                    function (property, callback) {
                        req.body.athleteId = athlete._id;
                        Profile.getAthleteProfile(req.body, res.callback);
                    }
                ],
                function (err, data2) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        callback(null, data2);
                    }

                });
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getTeamProfile: function (req, res) {
        if (req.body) {
            Profile.getTeamProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getSchoolProfile: function (req, res) {
        if (req.body) {
            Profile.getSchoolProfile(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getAthleteStats: function (req, res) {
        if (req.body) {
            Profile.getAthleteStats(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

    getTeamStats: function (req, res) {
        if (req.body) {
            Profile.getTeamStats(req.body, res.callback);
        } else {
            res.json({
                "data": "Body not Found",
                "value": false
            })
        }
    },

};
module.exports = _.assign(module.exports, controller);
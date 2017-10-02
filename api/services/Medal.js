var schema = new Schema({
    medalType: {
        type: String,
        enum: ["gold", "silver", "bronze"]
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport'
    },
    school: [{
        schoolId: {
            type: Schema.Types.ObjectId,
            ref: 'School'
        },
        schoolName: {
            type: String
        }
    }],
    team: [{
        type: Schema.Types.ObjectId,
        ref: 'TeamSport'
    }],
    player: [{
        type: Schema.Types.ObjectId,
        ref: 'Athelete'
    }]
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id name '
        },
        "school": {
            select: '_id name '
        },
        "team": {
            select: '_id name '
        },
        "player": {
            select: '_id name '
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Medal', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveMedal: function (data, callback) {
        console.log("1st Func");
        var matchObj = {
            "sportslist": data.sportslist,
            "gender": data.gender,
            "ageGroup": data.ageGroup
        };
        console.log(matchObj);
        Sport.findOne(matchObj).exec(function (err, sport) {
            if (err) {
                console.log("1st if");
                callback(err, null);
            } else if (!_.isEmpty(sport)) {
                console.log("2nd if");
                data.sport = sport._id;
                Medal.saveData(data, function (err, medalData) {
                    if (err) {
                        console.log("err", err);
                        callback("There was an error while saving", null);
                    } else {
                        if (_.isEmpty(medalData)) {
                            callback("No order data found", null);
                        } else {
                            callback(null, medalData);
                        }
                    }
                });
            } else {
                console.log("else");
                callback("No Data Found", null);
            }
        });
    },

    getTeamsAthletesBySport: function (matchSportObj, callback) {
        var sendObj = {};
        async.waterfall([
            //find sportId
            function (callback) {
                Sport.findOne(matchSportObj, function (err, sport) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sport)) {
                        var sportObj = {
                            "sport": sport._id
                        }
                        sendObj.sport = sportObj.sport = sport._id;
                        callback(null, sportObj);
                    } else {
                        callback("No Data Found", null)
                    }
                });

            },
            //find teams registered with that sportId
            function (sport, callback) {
                TeamSport.find(sport, function (err, teams) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sport)) {
                        console.log("teams", teams);
                        sendObj.teams = teams;
                        callback(null, sport);
                    } else {
                        sendObj.teams = [];
                        callback(null, sport);
                    }

                });

            },
            //find teams athletes with that sportId
            function (sport, callback) {
                IndividualSport.find(sport).deepPopulate("athleteId").exec(function (err, athletes) {
                    if (err) {
                        callback(err, null);
                    } else if (!_.isEmpty(sport)) {
                        console.log("teams", athletes);
                        sendObj.athletes = athletes;
                        callback(null, sendObj);
                    } else {
                        sendObj.athletes = [];
                        callback(null, sendObj);
                    }

                });
            }
        ], function (err, result) {
            console.log("result", result);
            callback(null, result)
        });

    },

    getCertificate: function (data, callback) {
        async.waterfall([
            
        ], function (err, result) {
            console.log("result", result);
            callback(null, result)
        })
    },


};
module.exports = _.assign(module.exports, exports, model);
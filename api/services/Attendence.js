var schema = new Schema({
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport'
    },
    attendenceListIndividual: [{
        athleteId: {
            type: Schema.Types.ObjectId,
            ref: 'Athelete'
        },
        athleteName: String,
        sfaId: String,
        schoolName: String,
        attendence: Boolean,
    }],
    attendenceListTeam: [{
        team: {
            type: Schema.Types.ObjectId,
            ref: 'TeamSport'
        },
        teamName: String,
        teamId: String,
        schoolName: String,
        attendence: Boolean,
    }]

});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Attendence', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAthleteForAttendence: function (data, callback) {
        async.waterfall([
                function (callback) {
                    var deepSearch = "sportslist.sportsListSubCategory";
                    Sport.findOne({
                        _id: data.sport
                    }).lean().deepPopulate(deepSearch).exec(function (err, found) {
                        if (err || _.isEmpty(found)) {
                            callback(null, {
                                error: "No data Found",
                                data: data
                            });
                        } else {
                            callback(null, found);
                        }
                    });
                },
                function (found, callback) {
                    if (found.error) {
                        callback(null, found);
                    } else if (found.sportslist.sportsListSubCategory.isTeam == true) {
                        StudentTeam.find({
                            sport: data.sport
                        }).deepPopulate("teamId studentId").lean().exec(function (err, studentData) {
                            if (err || _.isEmpty(studentData)) {
                                callback(null, {
                                    error: "No data Data",
                                    data: data
                                });
                            } else {
                                var complete = {};
                                complete.isTeam = true;
                                complete.list = [];
                                var teamData = _.groupBy(studentData, 'teamId.name');
                                _.each(teamData, function (teams) {
                                    var team = {};
                                    team.team = teams[0].teamId._id;
                                    team.teamId = teams[0].teamId.teamId;
                                    team.teamName = teams[0].teamId.name;
                                    team.schoolName = teams[0].teamId.schoolName;
                                    team.players = [];
                                    _.each(teams, function (player) {
                                        console.log("player", player);
                                        var member = {};
                                        member.sfaId = player.studentId.sfaId;
                                        if (player.studentId.middleName) {
                                            member.playerName = player.studentId.firstName + " " + player.studentId.middleName + " " + player.studentId.surname;
                                        } else {
                                            member.playerName = player.studentId.firstName + " " + player.studentId.surname;
                                        }
                                        team.players.push(member);
                                    });
                                    team.attendence = false;
                                    complete.list.push(team);
                                });
                                callback(null, complete);
                            }
                        });
                    } else {
                        IndividualSport.find({
                            sport: data.sport
                        }).deepPopulate("athleteId.school").lean().exec(function (err, individualData) {
                            if (err || _.isEmpty(individualData)) {
                                callback(null, {
                                    error: "No data teamData",
                                    data: data
                                });
                            } else {
                                var complete = {};
                                complete.isTeam = false;
                                complete.list = [];
                                _.each(individualData, function (n) {
                                    var single = {};
                                    single.athleteId = n.athleteId._id;
                                    if (n.middleName) {
                                        single.athleteName = n.athleteId.firstName + " " + n.athleteId.middleName + " " + n.athleteId.surname;
                                    } else {
                                        single.athleteName = n.athleteId.firstName + " " + n.athleteId.surname;
                                    }
                                    single.sfaId = n.athleteId.sfaId;
                                    if (n.athleteId.atheleteSchoolName) {
                                        single.schoolName = n.athleteId.atheleteSchoolName;
                                    } else {
                                        single.schoolName = n.athleteId.school.name;
                                    }
                                    single.attendence = false;
                                    complete.list.push(single);
                                });
                                callback(null, complete);
                            }
                        });
                    }
                },
                function (complete, callback) {
                    if (complete.error) {
                        callback(null, complete);
                    } else {
                        Attendence.find({
                            sport: data.sport
                        }).lean().exec(function (err, attendenceData) {
                            if (err || _.isEmpty(attendenceData)) {
                                callback(null, complete);
                            } else {
                                if (complete.isTeam == true) {
                                    var common = _.intersectionBy(attendenceData, complete.list, 'team');
                                    callback(null, common);
                                } else {
                                    var common = _.intersectionBy(attendenceData, complete.list, 'athleteId');
                                }
                                callback(null, common);
                            }
                        });
                    }
                },

            ],
            function (err, data2) {
                if (err) {
                    callback(null, []);
                } else if (data2) {
                    if (_.isEmpty(data2)) {
                        callback(null, data2);
                    } else {
                        callback(null, data2);
                    }
                }
            });
    },

    saveAttendence: function (data, callback) {
        if (data.isTeam == true) {
            var formdata = {};
            formdata.sport = data.sport;
            formdata.attendenceListTeam = data.list;
        } else {
            var formdata = {};
            formdata.sport = data.sport;
            formdata.attendenceListIndividual = data.list;
        }
        Attendence.saveData(formdata, function (err, complete) {
            if (err || _.isEmpty(complete)) {
                callback(err, null);
            } else {
                callback(null, {
                    error: err,
                    success: complete
                });
            }
        });
    }

};
module.exports = _.assign(module.exports, exports, model);
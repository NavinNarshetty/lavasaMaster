var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var uniqueValidator = require('mongoose-unique-validator');
var timestamps = require('mongoose-timestamp');
var validators = require('mongoose-validators');
var monguurl = require('monguurl');
var autoIncrement = require('mongoose-auto-increment');
var objectid = require("mongodb").ObjectID;
var moment = require('moment');
var request = require("request");
var generator = require('generate-password');

var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('EventBib', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeLine: function () {
        var pipeline = [
            // Stage 1
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 3
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 4
            {
                $unwind: {
                    path: "$sport.sportslist"
                }
            },

            // Stage 5
            {
                $lookup: {
                    "from": "agegroups",
                    "localField": "sport.ageGroup",
                    "foreignField": "_id",
                    "as": "sport.ageGroup"
                }
            },

            // Stage 6
            {
                $unwind: {
                    path: "$sport.ageGroup",
                }
            },
        ];
        return pipeline;
    },

    getAllTeamSport: function (data, callback) {
        console.log("data", data);
        var pipeLine = EventBib.getAggregatePipeLine();
        var newPipeLine = _.cloneDeep(pipeLine);

        if (_.isEmpty(data.team)) {
            console.log("inside if");
            newPipeLine.push({
                // Stage 7
                $match: {
                    "sport.sportslist._id": objectid(data.sportslist),
                    "sport.ageGroup._id": objectid(data.ageGroup),
                    "sport.gender": data.gender
                }
            });
        } else {
            console.log("inside else");
            newPipeLine.push({
                // Stage 7
                $match: {
                    "sport.sportslist._id": objectid(data.sportslist),
                    "sport.ageGroup._id": objectid(data.ageGroup),
                    "sport.gender": data.gender,
                    $or: [{
                        teamId: {
                            $regex: data.team,
                            $options: "i"
                        }
                    }, {
                        name: {
                            $regex: data.team,
                            $options: "i"
                        }
                    }]
                }
            });
        }
        console.log("newPipeLine", newPipeLine);
        TeamSport.aggregate(newPipeLine, function (err, totals) {
            if (err) {
                console.log(err);
                callback(err, "error in mongoose");
            } else {
                if (_.isEmpty(totals)) {
                    callback(null, []);
                } else {
                    callback(null, totals);
                }
            }
        });
    },

    getPlayerPerTeam: function (data, callback) {
        var deepSearch = "sport.sportslist.sportsListSubCategory.sportsListCategory sport.ageGroup sport.weight studentId.school";
        StudentTeam.find({
            teamId: data.teamId
        }).lean().deepPopulate(deepSearch).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    console.log("found", found);
                    callback(null, found);
                }
            }
        });
    },

    getAllAthleteBySchoolId: function (data, callback) {
        var matchObj = {
            $or: [{
                    school: data.schoolId
                }, {
                    firstName: {
                        $regex: data.input,
                        $options: "i"

                    }
                },
                {
                    middleName: {
                        $regex: data.input,
                        $options: "i"

                    },
                },
                {
                    surname: {
                        $regex: data.input,
                        $options: "i"

                    },
                }, {
                    sfaId: {
                        $regex: data.input,
                        $options: "i"

                    },
                }
            ]
        };

        var maxRow = Config.maxRow;
        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['firstName', 'sfaId', 'surname', 'middleName'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        Athelete.find(matchObj)
            .sort({
                createdAt: -1
            })
            .order(options)
            .keyword(options)
            .page(options, function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "Data is empty");
                } else {
                    callback(null, found);
                }
            });
    },

    getAthleteProfile: function (data, callback) {

    },

};
module.exports = _.assign(module.exports, exports, model);
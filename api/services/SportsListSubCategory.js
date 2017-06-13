var objectid = require("mongodb").ObjectID;
var schema = new Schema({
    name: {
        type: String,
    },
    sportsListCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SportsListCategory',
        index: true
    },
    isTeam: Boolean,
    filter: [{
        type: String
    }],
    rules: {
        type: Schema.Types.ObjectId,
        ref: 'Rules',
        index: true
    },



});

schema.plugin(deepPopulate, {
    populate: {
        'sportsListCategory': {
            select: '_id name'
        },
        'rules': {
            select: '_id name rulesAndRegulation'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SportsListSubCategory', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportsListCategory rules", "sportsListCategory rules"));
var model = {

    getAll: function (callback) {
        async.waterfall([
            function (callback) {
                SportsListSubCategory.find().deepPopulate("sportsListCategory").exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });
            },
            function (found, callback) {
                var results = _.groupBy(found, "sportsListCategory.name");
                callback(null, results);

            }
        ], function (err, results) {
            if (err) {
                console.log(err);
                callback(null, []);
            } else if (results) {
                if (_.isEmpty(results)) {
                    callback(null, []);
                } else {
                    callback(null, results);
                }
            }
        });

    },
    //not working this getone
    getOnenot: function (data, callback) {
        async.waterfall([
            function (callback) {
                // FindOne SportListSubCategory
                SportsListSubCategory.findOne({
                    _id: data._id
                }).exec(function (err, found) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(found)) {
                        callback(null, "Data is empty");
                    } else {
                        callback(null, found);
                    }
                });

            },
            function (found, callback) {
                if (found.isTeam) {
                    teamSport(found, callback);
                } else {
                    // individualSport(callback);
                }
                // FindOne 
            }
        ], function () {

        });



        function teamSport(val, callback) {

            if (Team >= val.maxTeam) {
                callback(err);
            } else {
                // 1. GetSportOfSportCategory
                // 2. groupBy
                // callback(GroupByResults);
            }
        }


        // waterfall: {}
        //      FindOne
        //      if(isTeam)
        //          countTeamForThatSchool
        //              if(team >= maxTeam) { callback(fail,"MAx Team Created") }
        //              else GoAhead
        //      
    },
    getSports: function (data, callback) {
        Sport.aggregate([
                // Stage 1
                {
                    $lookup: {
                        "from": "sportslists",
                        "localField": "sportslist",
                        "foreignField": "_id",
                        "as": "sportsListData"
                    }
                },

                // Stage 2
                {
                    $unwind: {
                        path: "$sportsListData",

                    }
                },

                // Stage 3
                {
                    $lookup: {
                        "from": "agegroups",
                        "localField": "ageGroup",
                        "foreignField": "_id",
                        "as": "ageData"
                    }
                },

                // Stage 4
                {
                    $unwind: {
                        path: "$ageData",

                    }
                },

                // Stage 3
                {
                    $lookup: {
                        "from": "sportslistsubcategories",
                        "localField": "sportsListData.sportsListSubCategory",
                        "foreignField": "_id",
                        "as": "sportsubData"
                    }
                },

                // Stage 4
                {
                    $unwind: {
                        path: "$sportsubData",

                    }
                },

                // Stage 5
                {
                    $match: {
                        "sportsubData._id": objectid(data._id)
                    }
                },
            ],
            function (err, totals) {
                if (err) {
                    console.log(err);
                    callback(err, "error in mongoose");
                } else {
                    if (_.isEmpty(totals)) {
                        callback(null, []);
                    } else {
                        var results = _.groupBy(totals, "gender");
                        callback(null, results);
                    }
                }
            });


        // Aggregate(Sport - > lookup SportList - > lookup sportListSubCategory, Match ID ) {
        //     Sports  callback(err,callback)
        // }

    },
    getRules: function (data, callback) {
        SportsListSubCategory.findOne({
            _id: data._id
        }).deepPopulate("rules").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });
    }


};
module.exports = _.assign(module.exports, exports, model);
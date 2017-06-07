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
    maxTeam: Number,


});

schema.plugin(deepPopulate, {
    populate: {
        'sportsListCategory': {
            select: '_id name'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SportsListSubCategory', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "sportsListCategory", "sportsListCategory"));
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
    getOne: function (data, callback) {
        async.waterfall([
            function (callback) {
                // FindOne SportListSubCategory
                SportsListSubCategory.getOne(data, function (err, complete) {

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
    getSports: function (id, callback) {
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
            function (err, ) {
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


        // Aggregate(Sport - > lookup SportList - > lookup sportListSubCategory, Match ID ) {
        //     Sports  callback(err,callback)
        // }

    },


};
module.exports = _.assign(module.exports, exports, model);
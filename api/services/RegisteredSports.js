var schema = new Schema({});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('RegisteredSports', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAggregatePipeLine: function (data) {

        var pipeline = [
            // Stage 1
            {
                $match: {
                    "school": objectid(data.school)
                }
            },

            // Stage 2
            {
                $lookup: {
                    "from": "sports",
                    "localField": "sport",
                    "foreignField": "_id",
                    "as": "sport"
                }
            },

            // Stage 3
            {
                $unwind: {
                    path: "$sport",
                }
            },

            // Stage 4
            {
                $lookup: {
                    "from": "sportslists",
                    "localField": "sport.sportslist",
                    "foreignField": "_id",
                    "as": "sport.sportslist"
                }
            },

            // Stage 5
            {
                $unwind: {
                    path: "$sport.sportslist",
                }
            },

            // Stage 6
            {
                $group: {
                    "_id": {
                        "sportName": "$sport.sportslist.name",
                        "sportsListSubCategory": "$sport.sportslist.sportsListSubCategory",
                    }
                }
            },

        ];
        return pipeline;
    },


    getAllRegisteredSport: function (data, callback) {
        var pipeLine = TeamSport.getAggregatePipeLine(n);
        StudentTeam.aggregate(pipeLine, function (err, totals) {
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

};
module.exports = _.assign(module.exports, exports, model);
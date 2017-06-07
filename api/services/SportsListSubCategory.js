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

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SportsListSubCategory', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAll: function (callback) {
        SportsListSubCategory.find().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

        // Find data
        // var retVal = _.groupBy(data,"SportListCategory");
    },
    getOne: function (data, callback) {
        async.waterfall([
            function () {
                // FindOne SportListSubCategory
            },
            function () {
                if (team) {
                    teamSport(findOneValueofSportListSubCategory, callback);
                } else {
                    // individualSport(callback);
                }
                // FindOne 
            }
        ], function () {

        });



        function teamSport(val, callback) {
            if (team >= val.maxTeam) {
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
        // Aggregate(Sport - > lookup SportList - > lookup sportListSubCategory, Match ID ) {
        //     Sports  callback(err,callback)
        // }

    },


};
module.exports = _.assign(module.exports, exports, model);
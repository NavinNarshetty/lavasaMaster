var schema = new Schema({
    type: {
        type: String,
        enum: ['athlete', 'school', 'college']
    },
    gender: {
        type: "String",
        enum: ['male', 'female']
    },
    award: {
        type: Schema.Types.ObjectId,
        ref: "Awards"
    },
    athlete: {
        type: Schema.Types.ObjectId,
        ref: "Athelete"
    },
    school: {
        type: Schema.Types.ObjectId,
        ref: "Registration"
    },
    sports: [{
        type: Schema.Types.ObjectId,
        ref: "Sport"
    }],
    coachName: "String",
    boostDetail: {
        schoolRank: "Number",
        total: "Number",
        year: "Number"
    },
    risingSport: "String"
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('SpecialAwardDetails', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAwardsList: function (awardListObj, awardDetailObj, callback) {
        async.waterfall([

            //getAll Athlete Awards
            function (callback) {
                Awards.find(awardListObj).lean().exec(function (err, awardsList) {
                    callback(null, awardsList);
                });
            },

            //filter all awards if its already added
            function (awardsList, callback) {
                var sendList = [];
                async.each(awardsList, function (award, callback) {
                    console.log(award._id);
                    awardDetailObj.award = award._id;
                    SpecialAwardDetails.find(awardDetailObj).lean().exec(function (err, found) {
                        if (err) {
                            callback(err);
                        } else if (_.isEmpty(found)) {
                            sendList.push(award);
                            callback(null);
                        } else {
                            callback(null);
                        }
                    });
                }, function (err) {
                    console.log("final called");
                    if (err) {
                        console.log(err);
                    } else {
                        callback(null, sendList);
                    }
                });
            }

        ], function (err, result) {
            callback(null, result);
        });
    }

};
module.exports = _.assign(module.exports, exports, model);
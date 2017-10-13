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
        ref: "SportsListSubCategory"
    }],
    coachName: "String",
    boostDetail: [{
        schoolRank: "Number",
        total: "Number",
        year: "String"
    }],
    risingSport: "String",
    footerImage:"String"
});

schema.plugin(deepPopulate, {
    populate: {
        "athlete": {
            select: '_id firstName surname middleName gender dob sfaId school'
        },
        "athlete.school": {
            select: '_id name sfaid'
        },
        "school": {
            select: '_id schoolName sfaID'
        }
       
    }
});
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
    },

    getPipeline: function () {
        return [
            // Stage 1
            {
                $lookup: {
                    "from": "awards",
                    "localField": "award",
                    "foreignField": "_id",
                    "as": "award"
                }
            },

            // Stage 2
            {
                $unwind: {
                    path: "$award",
                    includeArrayIndex: "arrayIndex", // optional
                    preserveNullAndEmptyArrays: false // optional
                }
            }
        ];
    },

    getAllAwardDetails: function (data, callback) {
        var pipeline = model.getPipeline();
        if (data.rising) {
            pipeline.push({
                $match: {
                    "award.name": "Sfa Rising Star Award"
                }
            });
        } else {
            pipeline.push({
                $match: {
                    "award.name": {
                        $ne: "Sfa Rising Star Award"
                    }
                }
            });
        }

        SpecialAwardDetails.aggregate(pipeline, function (err, arr) {
            callback(null, arr);
        });
    },

    getOneAwardDetails: function (data, callback) {
        SpecialAwardDetails.find(data).deepPopulate("award athlete athlete.school school sports").lean().exec(function (err, result) {
            callback(null,result);
        });
    }

};
module.exports = _.assign(module.exports, exports, model);
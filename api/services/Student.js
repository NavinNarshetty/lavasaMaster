var schema = new Schema({

    deleteStatus: Boolean,
    hours: String,
    minutes: String,
    timer: String,
    via: String,
    payment: String,
    sfaid: String,
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        index: true
    },
    lastname: String,
    firstname: String,
    middlename: String,
    gender: String,
    dob: Date,
    address: String,
    contact: String,
    email: String,
    dateOfForm: String,
    name: String,
    image: [{
        type: String
    }],
    video: [{
        type: String
    }],

    year: String,
    totalPoints: Number,
    totalPoints2015: Number,
    totalPoints2016: Number,
    totalPoints2017: Number,
    status: Boolean
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Student', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    updateStudentSFAID: function (data, callback) {
        var result = {};
        result.msg = "Updated";
        Student.find().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                var count = 0;
                async.eachSeries(found, function (value, callback) {

                    console.log("sfa:", value.year);
                    if (value.year) {
                        var year = value.year;
                    } else {
                        var year = "2016";
                    }

                    console.log("index", year);
                    count++;
                    var sfa = "M" + "A" + year + value.sfaid;
                    Student.update({
                        _id: value._id,
                    }, {
                        sfaid: sfa,
                    }).exec(function (err, updated) {
                        if (err) {
                            console.log("error :", err);
                            callback(null, err);
                        } else {

                            callback(null, updated);
                        }
                    });

                }, function (err) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                    } else {
                        result.count = count;
                        console.log("count", count);
                        callback(null, result);
                    }
                });

                //callback(null, found);
            }
        });


    }

};
module.exports = _.assign(module.exports, exports, model);
var generator = require('generate-password');
var schema = new Schema({
    deleteStatus: Boolean,
    timestamp: Date,
    sfaid: String,
    name: String,
    board: String,
    status: Boolean,
    address: String,
    location: String,
    email: String,
    contact: String,
    department: [{
        email: String,
        contact: String,
        designation: String,
        name: String,
        year: String,
    }],
    image: [{
        type: String
    }],
    video: [{
        type: String
    }],
    contingentLeader: [{
        type: String
    }],
    sports: [{
        year: String,
        sporttype: String,
        name: String,
    }],
    principal: String,
    paymentType: String,
    numberOfSports: String,
    representative: String,
    notpaidfor: String,
    year: [{
        type: String
    }],
    totalPoints: Number,
    totalPoints2015: Number,
    totalPoints2016: Number,
    totalPoints2017: Number,
    isRegistered: {
        type: Boolean,
        default: false
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('OldSchool', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllSchool: function (data, callback) {
        async.waterfall([
            function (callback) {
                OldSchool.find({
                    year: data.year
                }).lean().exec(function (err, oldSchoolData) {
                    if (err) {
                        callback(err, null);
                    } else {
                        if (_.isEmpty(oldSchoolData)) {
                            callback(null, []);
                        } else {
                            callback(null, oldSchoolData);
                        }
                    }
                });
            },
            function (oldSchoolData, callback) {
                async.each(oldSchoolData, function (mainData, callback) {
                        var final = {};
                        final.sportsDepartment = [];
                        final.institutionType = "school";
                        var year = data.year.substr(2, 2);
                        final.sfaID = "M" + "S" + year + mainData.sfaid;
                        final.status = "Verified";
                        final.password = generator.generate({
                            length: 8,
                            numbers: true
                        });
                        final.year = data.year;
                        final.schoolName = mainData.name;
                        final.affiliatedBoard = mainData.board;
                        final.schoolAddress = mainData.address;
                        final.state = "Maharastra";
                        final.city = "Mumbai";
                        final.locality = mainData.location;
                        final.landline = mainData.contact;
                        if (mainData.email) {
                            final.email = mainData.email;
                        }
                        final.schoolPrincipalName = mainData.principal;
                        final.oldId = mainData._id;
                        _.each(mainData.department, function (n) {
                            var department = {};
                            department.name = n.name;;
                            department.designation = n.designation;
                            department.mobile = n.contact;
                            department.email = n.email;
                            final.sportsDepartment.push(department);
                        });
                        var sports = _.groupBy(mainData.sports, 'sporttype');
                        var arr = _.keys(sports);
                        var i = 0;
                        while (i < arr.length) {
                            var name = arr[i];
                            if (name == "Team") {
                                final.teamSports = sports[name];
                            } else if (name == "Racquet") {
                                final.racquetSports = sports[name];
                            } else if (name == "Individual") {
                                final.individualSports = sports[name];
                            } else if (name == "Combat") {
                                final.combatSports = sports[name];
                            } else if (name == "Aquatics") {
                                final.aquaticsSports = sports[name];
                            } else if (name == "Target") {
                                final.targetSports = sports[name];
                            }
                            i++;
                        }

                        final.registrationFee = "cash";
                        final.paymentStatus = "Paid";
                        Registration.saveData(final, function (err, complete) {
                            if (err) {
                                callback(err, null);
                            } else {
                                callback(null, complete);
                            }
                        });
                    },
                    function (err) {
                        callback(null, "All data Stored");
                    });
            }
        ], function (err, found) {
            if (found) {
                callback(null, found);
            } else {
                callback(null, found);
            }
        });
    },
};
module.exports = _.assign(module.exports, exports, model);
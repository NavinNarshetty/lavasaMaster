var schema = new Schema({

    atheleteID: Number,
    sfaId: String,
    school: {
        type: Schema.Types.ObjectId,
        ref: 'Registration',
        index: true
    },
    idProof: String,

    surname: String,
    firstName: String,
    athleteMiddleName: String,
    gender: String,
    standard: String,
    photograph: String,
    dob: Date,
    ageProof: String,
    playedTournaments: {
        type: Boolean,
        default: "false"
    },

    mobile: String,
    enterOTP: String,
    email: String,

    address: String,
    state: String,
    district: String,
    city: String,
    pinCode: String,

    termsAndCondition: {
        type: Boolean,
        default: "false"
    },
    parentDetails: [{
        relation: String,
        name: String,
        surname: String,
        mobile: String,
        email: String
    }],
    registrationFee: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Athelete', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    //on athelete save and submit press 
    saveAthelete: function (data, callback) {
        //find and first time atheleteID idea is for string id generation if required
        Athelete.findOne({}, {
            _id: 0,
        }).sort({
            createdAt: -1
        }).exec(function (err, found) {
            console.log("found", found);
            if (err) {
                console.log(err);
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    var newDate = new Date(); //get current date
                    var year = newDate.getFullYear(); //get only year 
                    data.atheleteID = 1; //init atheleteID for first time
                    var city = data.city;
                    city = city.toUpperCase();
                    console.log("city", city);
                    var prefixCity = city.charAt(0);
                    console.log("prefixCity", prefixCity);
                    data.sfaId = prefixCity + "A" + year + data.atheleteID; //ex: city-> 'M'+'A'+2017+1

                    Athelete.saveData(data, function (err, athleteData) {
                        console.log("athleteData", athleteData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving order", null);
                        } else {
                            if (_.isEmpty(athleteData)) {
                                callback("No order data found", null);
                            } else {
                                callback(null, athleteData);
                            }
                        }
                    });
                    console.log("isempty");
                } else {
                    data.atheleteID = found.atheleteID + 1; //increment next atheleteID
                    var newDate = new Date();
                    var year = newDate.getFullYear();
                    var city = data.city;
                    var prefixCity = city.charAt(0);
                    console.log("prefixCity", prefixCity);
                    data.sfaId = prefixCity + "A" + year + data.atheleteID;
                    Athelete.saveData(data, function (err, athleteData) { //saves data to database collection
                        console.log("athleteData", athleteData);
                        if (err) {
                            console.log("err", err);
                            callback("There was an error while saving order", null);
                        } else {
                            if (_.isEmpty(athleteData)) {
                                callback("No order data found", null);
                            } else {
                                callback(null, athleteData);
                            }
                        }
                    });
                }
            }
        });
    },

    getAllAtheleteDetails: function (data, callback) {
        Athelete.find().exec(function (err, found) { //finds all athelete
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback(null, "Data is empty");
            } else {
                callback(null, found);
            }
        });

    },

    getOneAtheleteDetails: function (data, callback) {
        Athelete.findOne({ //finds one with refrence to id
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


};
module.exports = _.assign(module.exports, exports, model);
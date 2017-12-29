var schema = new Schema({
    name: {
        type: String,
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Weight', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getAll: function (data, callback) {
        Weight.find().lean().exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    callback(null, found);
                }
            }
        });
    },

    getWeightsByEvent: function(data,callback){
        Sport.find(data,"weight").deepPopulate("weight").select({"_id":0}).lean().exec(function(err,data){
            if(err){
                callback(err,null);
            }else{
                callback(null,data);
            }
        });
    },

    getWeightPerSportslist: function (data, callback) {
        Sport.find({
            sportslist: data.sportslist
        }).lean().deepPopulate("weight").exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else {
                console.log(found);
                if (_.isEmpty(found)) {
                    callback(null, []);
                } else {
                    var age = _.uniqBy(found, "weight.name");
                    if (age.length <= 1) {
                        if (age.length <= 0) {
                            callback(null, []);
                        } else {
                            if (_.isEmpty(age[0].weight)) {
                                callback(null, []);
                            } else {
                                callback(null, age);
                            }
                        }
                    } else {
                        callback(null, age);
                    }
                }
            }
        });
    },

    getAthletesByEvent: function(data,callback){
        // console.log("sport",data);
        IndividualSport.find(data,"athleteId sport").deepPopulate("athleteId athleteId.school").exec(function(err,result){
            if(err){
                callback(err,null);
            }else if(!_.isEmpty(result)){
                callback(null,result);
            }else{
                callback("No Athletes Found",[]);
            }
        });
    },

   

};
module.exports = _.assign(module.exports, exports, model);
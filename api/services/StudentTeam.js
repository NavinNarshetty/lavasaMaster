var schema = new Schema({
    teamId: {
        type: Schema.Types.ObjectId,
        ref: 'TeamSport',
        index: true,
        key: 'studentTeam'
    },
    sport: {
        type: Schema.Types.ObjectId,
        ref: 'Sport',
        index: true
    },
    studentId: {
        type: Schema.Types.ObjectId,
        ref: 'Athelete',
        index: true
    },
    isCaptain: Boolean,
    isGoalKeeper: Boolean,
    perSportUniqueId: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('StudentTeam', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    saveInTeam: function (data, callback) {
        StudentTeam.saveData(data, function (err, teamData) {
            console.log("teamData", teamData);
            if (err) {
                console.log("err", err);
                callback("There was an error ", null);
            } else {
                if (_.isEmpty(teamData)) {
                    callback("No data found", null);
                } else {
                    callback(null, teamData);
                }
            }
        });
    },



};
module.exports = _.assign(module.exports, exports, model);
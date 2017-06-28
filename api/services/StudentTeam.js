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

schema.plugin(deepPopulate, {
    populate: {
        'teamId': {
            select: '_id name teamId school'
        },
        'studentId': {
            select: '_id firstName middleName surname'
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('StudentTeam', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    saveInTeam: function (data, callback) {

        console.log("** inside saveInTeam of studentTeam  **", data);

        StudentTeam.saveData(data, function (err, teamData) {
            // console.log("teamData", teamData);
            if (err) {
                console.log("err", err);
                callback("There was an error ", null);
            } else {
                if (_.isEmpty(teamData)) {
                    callback("No data found", null);
                } else {
                    console.log("** inside saveInTeam success response**", teamData);
                    callback(null, teamData);
                }
            }
        });
    },

    search: function (data, callback) {
        var Model = this;
        var Const = this(data);
        var maxRow = Config.maxRow;

        var page = 1;
        if (data.page) {
            page = data.page;
        }
        var field = data.field;
        var options = {
            field: data.field,
            filters: {
                keyword: {
                    fields: ['teamId'],
                    term: data.keyword
                }
            },
            sort: {
                desc: 'createdAt'
            },
            start: (page - 1) * maxRow,
            count: maxRow
        };
        var deepSearch = "studentId teamId";
        var Search = Model.find(data.keyword)

            .order(options)
            .deepPopulate(deepSearch)
            .keyword(options)
            .page(options, callback);

    },

};
module.exports = _.assign(module.exports, exports, model);
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
            select: '_id name teamId school schoolName'
        },
        'studentId': {
            select: '_id firstName middleName sfaId surname school athleteSchoolName'
        },
        'studentId.school': {
            select: 'name'
        },
        "sport": {
            select: '_id sportslist gender ageGroup maxTeamPlayers minTeamPlayers weight eventPdf'
        },
        "sport.sportslist.sportsListSubCategory": {
            select: '_id name inactiveimage image'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('StudentTeam', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveInTeam: function (data, callback) {
        StudentTeam.saveData(data, function (err, teamData) {
            if (err) {
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
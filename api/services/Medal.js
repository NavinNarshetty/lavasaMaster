var schema = new Schema({
    medalType:{
        type: String,
        enum: ["gold", "silver", "bronze"]
    },
    sport:{
        type:Schema.Types.ObjectId,
        ref:'Sport'
    },
    school:[{
        type:Schema.Types.ObjectId,
        ref:'School'
    }],
    team:[{
        type:Schema.Types.ObjectId,
        ref:'TeamSport'
    }],
    player:[{
        type:Schema.Types.ObjectId,
        ref:'Athelete'
    }]
});

schema.plugin(deepPopulate, {
    populate: {
        "sport": {
            select: '_id name '
        },
        "school": {
            select: '_id name '
        },
         "team": {
            select: '_id name '
        },
         "player": {
            select: '_id name '
        },
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Medal', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    saveMedal:function(){
        
    }

};
module.exports = _.assign(module.exports, exports, model);
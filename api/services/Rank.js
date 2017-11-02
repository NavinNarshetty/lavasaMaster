var schema = new Schema({
    name: {
        type: String
    },
    medal:[{
        name:String,
        count:Number,
        points:Number
    }],
    totalCount:Number,
    totalPoints:Number,
    totalMatches:Number,
    sportData:[{
        name:String,
        medals:[{
            name:String,
            count:Number,
            points:Number
        }],
        count:Number,        
        totalCount:Number,
        totalPoints:Number,
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Rank', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {};
module.exports = _.assign(module.exports, exports, model);
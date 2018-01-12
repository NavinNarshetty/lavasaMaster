var schema = new Schema({
    title: {
        type: String,
        unique: true
    },
    folderName: String,
    gender: [{
        type: String
    }],
    tags: [{
        type: String
    }],
    shareUrl: String,
    mediaType: String,
    mediaLink: String,
    year: String,
    folderType: String,
    eventName: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Gallery', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {

    getAllPhotosByType: function (data, callback) {
        Gallery.aggregate(
            [{
                $match: {
                    "mediaType": "photo",
                    "folderType": data.folderType
                }
            }, {
                $group: {
                    "_id": "$folderName",
                    "folderName":{
                        "$first":"$folderName"
                    },
                    "totalCount": {
                        "$sum": 1
                    },
                    "mediaLink": {
                        "$first": "$mediaLink"
                    }
                }
            }],
            function (err, photos) {
                if (err) {
                    callback(err, null);
                } else if (!_.isEmpty(photos)) {
                    callback(null, photos);
                } else {
                    callback(null, []);
                }
            }
        );
    },

    getAllPhotosByFolder:function(data,callback){
       
            Gallery.find({
                "mediaType":"photo",
                "folderType":data.folderType,
                "folderName":data.folderName
            },"mediaLink title tags shareUrl").lean().exec(function(err,photos){
                if(err){
                    callback(err,null);
                }else if(!_.isEmpty(photos)){
                    callback(null,photos);
                }else{
                    callback(null,[]);
                }
            });
      
    },


};
module.exports = _.assign(module.exports, exports, model);
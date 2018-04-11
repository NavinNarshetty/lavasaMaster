var schema = new Schema({
  featureName: String,
  featureDetails: [{
    packageName: {
      type: Schema.Types.ObjectId,
      ref: 'Package',
    },
    featureOrder: Number,
    featureType: String,
    featureCheck: Boolean,
    featureText: String
  }],
  featureUserType: String,
  featureLogo: String
});

schema.plugin(deepPopulate, {
  populate: {
    'featureDetails.packageName': {
      select: "_id name order"
    }
  }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Featurepackage', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, 'featureDetails.packageName', 'featureDetails.packageName'));
var model = {
  getAggregatePipeline: function (data) {
    console.log(data);
    var pipeline = [
      // Stage 1
      {
        $match: {
          "featureDetails.packageName": ObjectId(data._id)
        }
      },

    ];
    return pipeline;
  },
  featureDetailByPackage: function (data, callback) {
    var pipeLine = Featurepackage.getAggregatePipeline(data);
    Featurepackage.aggregate(pipeLine, function (err, features) {
      if (err) {
        callback(err, "error in mongoose");
      } else if (_.isEmpty(features)) {
        callback(null, []);
      } else {
        callback(null, features);
      }
    });
  }
};
module.exports = _.assign(module.exports, exports, model);
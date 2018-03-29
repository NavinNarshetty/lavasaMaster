module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
  getAllPackages: function (req, res) {
    Package.find({
      packageUser: req.body.param
    }).lean().exec(
      function (err, found) {
        if (err) {
          res.callback(err, null);
        } else {
          res.callback(null, found);
        }
      }
    )
  }
};
module.exports = _.assign(module.exports, controller);
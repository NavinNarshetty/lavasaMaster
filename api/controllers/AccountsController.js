module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

  getAccount: function (req, res) {
    Accounts.findOne({
      _id: req.body._id
    }).lean().deepPopulate("athlete athlete.school school transaction").exec(
      function (err, found) {
        if (err) {
          res.callback(err, null);
        } else {
          res.callback(null, found);
        }
      }
    )
  },

  getAthleteAccount: function (req, res) {
    if (req.body) {
      Accounts.getAthleteAccount(req.body, res.callback);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      })
    }
  },

  getSchoolAccount: function (req, res) {
    if (req.body) {
      Accounts.getSchoolAccount(req.body, res.callback);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      })
    }
  },
};
module.exports = _.assign(module.exports, controller);
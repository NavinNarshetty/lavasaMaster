module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {

  getAccount: function (req, res) {
    if (req.body) {
      Accounts.getAccount(req.body, res.callback);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      });
    }
  },
  getStatuts: function (req, res) {
    if (req.body) {
      Accounts.getStatuts(req.body, res.callback);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      });
    }
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
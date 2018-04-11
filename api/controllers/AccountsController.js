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
  getStatus: function (req, res) {
    if (req.body) {
      Accounts.getStatus(req.body, res.callback);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      });
    }
  },

  generateAthleteExcel: function (req, res) {
    if (req.body) {
      Accounts.generateAthleteExcel(req.body, res);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      });
    }
  },

  generateSchoolExcel: function (req, res) {
    if (req.body) {
      Accounts.generateSchoolExcel(req.body, res);
    } else {
      res.json({
        "data": "Body not Found",
        "value": false
      });
    }
  },


  upgradeAccount: function (req, res) {
    if (req.body) {
      Accounts.upgradeAccount(req.body, res.callback);
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
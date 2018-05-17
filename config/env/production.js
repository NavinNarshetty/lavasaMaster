/**
 * Production environment settings
 *
 * This file can include shared settings for a production environment,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the production        *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMysqlServer'
  // },

  /***************************************************************************
   * Set the port in the production environment to 80                        *
   ***************************************************************************/

  port: 1337,
  // port: 878,
  // realHost: "https://mumbaischool.sfanow.in",
  // realHost: "http://mumbaischool.sfanow.in/2017",
  // realHost: "http://mumbaicollege.sfanow.in",
  // realHost: "http://hyderabadschool.sfanow.in",
  // realHost: "http://hyderabadcollege.sfanow.in",
  // realHost: "http://ahmedabadschool.sfanow.in",
  // realHost: "http://ahmedabadcollege.sfanow.in",
  realHost: "http://testmumbaischool.sfanow.in",
  // realHost: "http://testmumbai2015.sfanow.in",
  // realHost: "http://testmumbai2016.sfanow.in",
  // realHost: "http://testmumbaicollege.sfanow.in",
  // realHost: "http://testhyderabadschool.sfanow.in",
  // realHost: "http://testhyderabadcollege.sfanow.in",
  // realHost: "http://testahmedabadschool.sfanow.in",
  // realHost: "http://testahmedabadcollege.sfanow.in",

  // emails: ["chintan@wohlig.com", "raj@wohlig.com", "supriya.bhartiya@wohlig.com", "rahi.shah@sfanow.in", "shiva.singh@sfanow.in", "sunil.rathod@sfanow.in", "venkatesh.rathod@sfanow.in", "neeraj.jaiswal@sfanow.in", "rahul.singh@sfanow.in", "datateam@sfanow.in", "akshay.singh@sfanow.in"]
  accessLevels: [{
    name: "Super Admin",
    emails: ['rahi.shah@sfanow.in', "raj@wohlig.com"]
  }, {
    name: "Admin",
    emails: ["chintan@wohlig.com", "supriya.bhartiya@wohlig.com", "shiva.singh@sfanow.in", "suksha.khodake@wohlig.com", "pratik.patel@wohlig.com", "sagar.mulchandani@wohlig.com", "navin.narshetty@wohlig.com"]
  }, {
    name: "Sports Ops",
    emails: ['rajas.joshi@sfanow.in', 'shamik.shah@sfanow.in', 'aditi.parikh@sfanow.in', 'faron.fernandes@sfanow.in']
  }, {
    name: "Volunteers",
    emails: ['akshay.singh@sfanow.in', 'gargee.potdar@sfanow.in', 'sonia.chhabria@sfanow.in', 'venkatesh.rathod@sfanow.in']
  }, {
    name: "Accounts",
    emails: ['accounts@sfanow.in', 'payments@sfanow.in']
  }],
  /***************************************************************************
   * Set the log level in production environment to "silent"                 *
   ***************************************************************************/

  // log: {
  //   level: "silent"
  // }

};


// var cron = require('node-cron');

// cron.schedule('*/2 * * * *', function () {
//   console.log("Running Athlete Get Draws");
//   Match.getDrawFormats({}, function () {
//     console.log("Completed Crons");
//   });
// });
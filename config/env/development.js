/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

    /***************************************************************************
     * Set the default database connection for models in the development       *
     * environment (see config/connections.js and config/models.js )           *
     ***************************************************************************/

    // models: {
    //   connection: 'someMongodbServer'
    // }
    port: 1337,
    realHost: "http://wohlig.io:1337",

    accessLevels: [{
        name: "Super Admin",
        emails: ['pratik.wohlig@gmail.com', 'rahi.shah@sfanow.in']
    }, {
        name: "Admin",
        emails: ['pratik.wohlig@gmail.com', "chintan@wohlig.com", "raj@wohlig.com", "supriya.bhartiya@wohlig.com", "rahi.shah@sfanow.in", "shiva.singh@sfanow.in", "sunil.rathod@sfanow.in", "venkatesh.rathod@sfanow.in", "neeraj.jaiswal@sfanow.in", "suksha.khodake@wohlig.com", "pratik.patel@wohlig.com", "sagar.mulchandani@wohlig.com", "navin.narshetty@wohlig.com"]
    }, {
        name: "Sports Ops",
        emails: ['rajas.joshi@sfanow.in', 'shamik.shah@sfanow.in', 'aditi.parikh@sfanow.in', 'faron.fernandes@sfanow.in']
    }, {
        name: "Volunteers",
        emails: ['akshay.singh@sfanow.in', 'gargee.potdar@sfanow.in', 'rahi.shah@sfanow.in', 'sonia.chhabria@sfanow.in', 'venkatesh.rathod@sfanow.in']
    }, {
        name: "Accounts",
        emails: ['accounts@sfanow.in', 'payments@sfanow.in']
    }],



};
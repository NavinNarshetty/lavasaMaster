/**
 * `clean`
 *
 * ---------------------------------------------------------------
 *
 * Remove the files and folders in your Sails app's web root
 * (conventionally a hidden directory called `.tmp/public`).
 *
 * For usage docs see:
 *   https://github.com/gruntjs/grunt-contrib-clean
 *
 */
module.exports = function (grunt) {

    grunt.config.set('clean', {
        development: ['.tmp/public/frontend/css', '.tmp/public/frontend/js', '.tmp/public/frontend/fonts', '.tmp/public/frontend/views', '.tmp/public/frontend/img', '.tmp/public/digital/css', '.tmp/public/digital/js', '.tmp/public/digital/fonts', '.tmp/public/digital/views', '.tmp/public/digital/img'],
        production: ['.tmp/public/frontend', '.tmp/public/digital'],
        productionFiles: ['.tmp/public/frontend/css/main.css', '.tmp/public/frontend/js/main.js', '.tmp/public/digital/css/main.css', '.tmp/public/digital/js/main.js'],
        backend: ['.tmp/public/backend'],
        upload: ['.tmp/uploads/**'],
        uploadApp: ['.tmp/uploads/app.js']
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
};
var historyApiFallback = require('connect-history-api-fallback');
module.exports = function (grunt) {
    var folderName = grunt.option('target');
    grunt.config.set('browserSync', {
        bsFiles: {
            src: [folderName + '/**/*.css', folderName + "/**/*.js", folderName + "/**/*.html", folderName + "/img/**"]
        },
        options: {
            server: {
                baseDir: folderName,
                routes: {
                    "/bower_components": "bower_components"
                },
                middleware: [historyApiFallback()]
            },
            port: 8080,
            notify: false,
            browser: "google chrome",
        }
    });

    grunt.loadNpmTasks('grunt-browser-sync');
};
module.exports = function (grunt) {
    var folderName = grunt.option('target') || "frontend";
    grunt.config.set('concat_css', {
        options: {
            sourceMap: true
        },
        all: {
            src: [folderName + "/sass/main.css"],
            dest: folderName + "/sass/complete.css"
        },
    });

    grunt.loadNpmTasks('grunt-concat-css');
};
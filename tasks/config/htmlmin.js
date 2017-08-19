module.exports = function (grunt) {
    var folderName = grunt.option('target') || "frontend";
    grunt.config.set('htmlmin', {
        production: { // Another target
            files: [{
                expand: true, // Enable dynamic expansion.
                cwd: './' + folderName + '/', // Src matches are relative to this path.
                src: ['views/**/*.html'], // Actual pattern(s) to match.
                dest: '.tmp/public/' + folderName + '/', // Destination path prefix.
            }],
            options: { // Target options
                removeComments: true,
                collapseWhitespace: true
            },
        }
    });
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
};
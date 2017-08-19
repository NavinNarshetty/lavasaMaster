module.exports = function (grunt) {
    var folderName = grunt.option('target') || "frontend";
    grunt.config.set('postcss', {
        options: {
            map: false,
            processors: [
                require('autoprefixer')
            ],
            writeDest: true
        },
        dist: {
            src: folderName + '/css/*.css'
        }
    });

    grunt.loadNpmTasks('grunt-postcss');
};
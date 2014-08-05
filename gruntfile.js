module.exports = function(grunt) {
    'use strict';

    /**
     * @method merge
     * Shallow merges any number of src objects into the dest object.
     * @param {Object} dest - The destination object.
     * @param {Object} src - Any number of source objects.
     */
    function merge() {
        var dest = arguments[0],
            srcs = Array.prototype.slice.call(arguments, 1);

        srcs.forEach(function(src) {
            Object.keys(src).forEach(function(key) {
                dest[key] = src[key];
            });
        });
    }

    //settings for all projects
    var gruntConfig = {pkg: grunt.file.readJSON('package.json')};
    var npmTasks = [];
    var isDev = process.env.NODE_ENV !== 'production';
    var jsonFiles = ['*.json'];
    var watchConfig = {};
    var buildTasks = [];

    //settings for JavaScript projects
    var srcFiles = ['src/**/*.js', '!src/**/tests/*_tests.js'];
    var testFiles = ['src/**/tests/*_tests.js'];
    var lintFiles = ['gruntfile.js'].concat(srcFiles, testFiles);
    var testTasks = ['jsonlint', 'jshint'];
    var vendorFiles = [];
    var uglifyFiles = {};
    var jasmineSrc = '';
    var jasmineSpecs = '';

    watchConfig.src = {
        files: srcFiles,
        tasks: ['buildSrc']
    };

    buildTasks.push('buildSrc');
    jsonFiles.push('.jshintrc');
    
    //settings and tasks for to projects using ECMAScript6
    jasmineSrc = '.tmp/tests.js';
    jasmineSpecs = '';
    vendorFiles.push('lib/traceur-runtime/traceur-runtime.min.js');
    npmTasks.push('grunt-traceur-compiler');
    uglifyFiles['build/teste'] = '.tmp/src.js';
    uglifyFiles['.tmp/tests.js'] = '.tmp/tests.js';

    merge(gruntConfig, {
        traceur: {
            options: {
                experimental: true
            },
            src: {
                files: {
                    '.tmp/src.js': 'src/teste/app.js'
                }
            },
            test: {
                files: {
                    '.tmp/tests.js': testFiles
                }
            }
        }
    });

    grunt.registerTask('buildSrc', ['traceur', 'uglify']);
    
    //tasks for JavaScript projects
    testTasks.push('build');
    testTasks.push('jasmine');
    npmTasks.push('grunt-contrib-uglify');
    merge(gruntConfig, {
        uglify: {
            compile: {
                files: uglifyFiles
            }
        }
    });
    
    //settings common to projects using jQuery
    vendorFiles.push('lib/jquery/jquery.min.js');
    
    //settings common to projects using Stylus
    var stylusFiles = {};
    var styleFiles = ['style/*.styl', 'style/**/*.styl'];

    watchConfig.style = {
        files: styleFiles,
        tasks: ['buildStyle']
    };

    buildTasks.unshift('buildStyle');
    npmTasks.push('grunt-contrib-stylus');
    stylusFiles['build/teste.css'] = styleFiles;

    merge(gruntConfig, {
        stylus: {
            compile: {
                files: stylusFiles,
                options: {
                    paths: ['./style'],
                    import: ['nib']
                }
            }
        }
    });

    grunt.registerTask('buildStyle', ['stylus']);
    
    if (isDev) {
        //tasks for developing with JavaScript
        npmTasks.push('grunt-contrib-jasmine');
        npmTasks.push('grunt-contrib-jshint');
        npmTasks.push('grunt-jsonlint');

        merge(gruntConfig, {
            jasmine: {
                src: jasmineSrc,
                options: {
                    vendor: vendorFiles,
                    specs: jasmineSpecs,
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: '.tmp/coverage.json',
                        report: [{type: 'text-summary'}, {type: 'html'}],
                        thresholds: {
                            lines: 100,
                            statements: 100,
                            branches: 100,
                            functions: 100
                        }
                    }
                }
            },

            jshint: {
                test: lintFiles,
                options: {
                    jshintrc: '.jshintrc'
                }
            },

            jsonlint: {
                test: {
                    src: jsonFiles
                }
            }
        });

        grunt.registerTask('test', testTasks);
        
        //always merge watch in development environments
        npmTasks.push('grunt-contrib-watch');
        merge(gruntConfig, {
            watch: watchConfig
        });
        grunt.registerTask('default', ['watch']);
        grunt.registerTask('watch', ['watch']);
    }
    grunt.registerTask('build', buildTasks);
    grunt.initConfig(gruntConfig);
    npmTasks.forEach(function(task) {
        grunt.loadNpmTasks(task);
    });
};

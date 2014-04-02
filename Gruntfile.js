'use strict';

module.exports = function( grunt ) {


    grunt.initConfig( {

        connect: {
            server: {
                options: {
                    port: 3333,
                    base: './',
                    keepalive: true
                }
            }
        },
        requirejs: {
            all: {
                options: {
                    baseUrl: './src',
                    name: 'build',
                    mainConfigFile: 'src/main.js',
                    findNestedDependencies: true,
                    out: 'build/coo.js',
                    optimize: 'none'
                }
            }
        }

    } );


    grunt.loadNpmTasks( 'grunt-contrib-clean' );
    grunt.loadNpmTasks( 'grunt-contrib-connect' );
    grunt.loadNpmTasks( 'grunt-contrib-requirejs' );

    grunt.registerTask( 'build', [ 'requirejs' ] );
    grunt.registerTask( 'default', [ 'connect' ] );

};
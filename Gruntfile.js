'use strict';

module.exports = function( grunt ) {


    grunt.initConfig( {

        connect: {
            server: {
                options: {
                    port: 80,
                    base: './',
                    keepalive: true
                }
            }
        }

    } );


    grunt.loadNpmTasks( 'grunt-contrib-connect' );

    grunt.registerTask( 'default', [ 'connect' ] );

};
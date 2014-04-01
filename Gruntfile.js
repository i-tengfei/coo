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
        }

    } );


    grunt.loadNpmTasks( 'grunt-contrib-connect' );

    grunt.registerTask( 'default', [ 'connect' ] );

};
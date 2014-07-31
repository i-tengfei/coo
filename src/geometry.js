define( [ 'Base' ], function ( Base ) {

    var Geometry = Base.extend( {

        defaults: Base._.extend( { }, Base.prototype.defaults ),

        initialize: function( options, pass ){

            Geometry.super.initialize.call( this, options );
            this.count = undefined;

            this.pass = pass;

        },

        initOptions: function( options ){

            Geometry.super.initOptions.call( this, options );
            this.faces = options.faces;
            this.indexCount = options.indexCount;

        },

        createIndex: function( GL ){

            this.indexBuffer = GL.createBuffer( );

        },

        setData: function( GL ){

            GL.bindBuffer( GL.ELEMENT_ARRAY_BUFFER, this.indexBuffer );
            GL.bufferData( GL.ELEMENT_ARRAY_BUFFER, this.faces, GL.STATIC_DRAW );

        },

        drawElements: function( GL ){

            GL.drawElements( GL.TRIANGLES, this.indexCount, GL.UNSIGNED_SHORT, 0 );

        }

    } );

    return Geometry;

} );
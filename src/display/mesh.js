define( [ 'Display', 'CONST', 'Sphere' ], function ( Display, CONST, Sphere ) {

    var Mesh = Display.extend( {

        defaults: Display._.extend( {}, Display.prototype.defaults ),

        initialize: function( options, geometry, material ){

            Mesh.super.initialize.call( this, options );

            this.geometry = geometry;
            this.material = material;

        },

        initOptions: function( options ){
            Mesh.super.initOptions.call( this, options );
        },

        __computeSphere: function( ){

            var va = this.geometry.pass.vertexAttribute;
            return Sphere( ).setFromPoints( [ va.max, va.min ] );

        },

        clone: function( object, recursive ){

            if ( object === undefined ) object = new Mesh( {}, this.geometry, this.material );

            Display.prototype.clone.call( this, object, recursive );

            return object;

        }

    } );

    return Mesh;

} );
define( [ 'Base' ], function ( Base ) {

    var Attribute = Base.extend( {

        initialize: function( name, data, size, type ){

            Attribute.super.initialize.call( this );

            this.name = name;
            this.data = data;
            this.size = size || 3;
            this.type = type || window.Float32Array;

            this.dirty = true;

            this.name === 'index' && ( this.type = window.Uint16Array );

        },

        create: function( shader ){

            var GL = this.GL = shader.GL;
            this.shader = shader;

            this.buffer = GL.createBuffer( );
            if( this.name !== 'index' ){
                this.location = GL.getAttribLocation( shader.program, this.name );
            }

        },

        draw: function( shader ){

            var name = this.name,
                GL = this.GL,
                data = this.data;

            this.dirty && this.bind( function( ){
                GL.bufferData( name === 'index' ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER, new this.type( data ), GL.STATIC_DRAW );
                this.dirty = false;
            }.bind( this ) );
            name === 'index' || this.bind( function( ){
                GL.vertexAttribPointer( this.location, this.size, this.GL.FLOAT, false, 0, 0 );
            }.bind( this ) );

        },
        enable: function( ){
            if( this.location !== -1 ) {
                this.GL.enableVertexAttribArray( this.location );
            }
        },
        disable: function( ){
            if( this.location !== -1 ) {
                this.GL.disableVertexAttribArray( this.location );
            }
        },
        bind: function( fn ){
            var GL = this.GL;
            GL.bindBuffer( this.name === 'index' ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER, this.buffer );
            fn( );
        }
        
    } );

    return Attribute;

} );
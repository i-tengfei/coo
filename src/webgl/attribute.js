define( [ 'Base' ], function ( Base ) {

    var Attribute = Base.extend( {

        defaults: Base._.extend( {
            GLName: undefined,
            data: undefined,
            stride: 0,
            type: Base.prototype.CONST.FLOAT_VEC3,
            offset: undefined,
            count: undefined,
            size: 3,
            Constructor: Float32Array,
            bufferData: undefined,
            max: undefined,
            min: undefined
        }, Base.prototype.defaults ),

        initialize: function( options ){

            Attribute.super.initialize.call( this, options );

            this.__defineGetter__( 'GL', function( ){
                return this.__GL;
            } );

            this.dirty = true;

        },

        initOptions: function( options ){

            Attribute.super.initOptions.call( this, options );

            switch( options.type ) {
                case this.CONST.FLOAT_VEC2:
                    this.size = 2;
                    this.Constructor = Float32Array;
                    break;
                case this.CONST.FLOAT_VEC3:
                    this.size = 3;
                    this.Constructor = Float32Array;
                    break;
                case this.CONST.FLOAT_VEC4:
                    this.size = 4;
                    this.Constructor = Float32Array;
                    break;
                case this.CONST.FLOAT:
                    this.size = 1;
                    this.Constructor = Float32Array;
                    break;
                default:
                    this.size = options.size;
                    this.Constructor = options.Constructor;
                    break;
            }

            this.GLName = options.GLName;
            this.data = options.data;
            this.stride = options.stride;
            this.type = options.type;
            this.offset = options.offset;
            this.count = options.count;
            this.bufferData = options.bufferData || ( options.data && ( this.offset !== undefined ) && new this.Constructor( options.data, this.offset || 0, this.count * this.size || options.data.length ) );
            this.max = options.max;
            this.min = options.min;
            
        },

        create: function( program ){

            if( this.buffer === undefined ){

                var GL = this.__GL = program.GL;
                this.program = program;

                this.buffer = GL.createBuffer( );
                this.location = GL.getAttribLocation( program.GLProgram, this.GLName );

            }


        },

        setBufferData: function( data ){

            if( this.dirty ){

                var GL = this.GL;
                this.bufferData = data || this.bufferData || new this.Constructor( this.data, this.offset, this.count * this.size );
                GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
                GL.bufferData(
                    GL.ARRAY_BUFFER,
                    this.bufferData,
                    GL.STATIC_DRAW
                );

                this.dirty = false;

            }

        },

        render: function( shader ){

            var GL = this.GL;

            GL.bindBuffer( GL.ARRAY_BUFFER, this.buffer );
            this.enable( );
            GL.vertexAttribPointer( this.location, this.size, this.GL.FLOAT, false, this.stride, 0 );

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
        }
        
    } );

    return Attribute;

} );
define( [ 'Base' ], function ( Base ) {

    var Uniform = Base.extend( {

        defaults: Base._.extend( {
            GLName: undefined,
            data: undefined,
            type: Base.prototype.CONST.FLOAT_MAT4,
            Constructor: Float32Array
        }, Base.prototype.defaults ),

        initialize: function( options ){

            Uniform.super.initialize.call( this, options );
            this.dirty = true;

            this.__defineGetter__( 'data', function( ){
                return this.__data;
            } );
            this.__defineSetter__( 'data', function( value ){
                this.__data = value;
                this.dirty = true;
            } );

            this.__defineGetter__( 'GL', function( ){
                return this.__GL;
            } );

        },

        initOptions: function( options ){

            Uniform.super.initOptions.call( this, options );

            switch( options.type ){
                case this.CONST.FLOAT_MAT4:
                    this.mat = true;
                    this.fn = 'uniformMatrix4fv';
                    this.Constructor = Float32Array;
                    break;
                case this.CONST.FLOAT_MAT3:
                    this.mat = true;
                    this.fn = 'uniformMatrix3fv';
                    this.Constructor = Float32Array;
                    break;
                case this.CONST.FLOAT_MAT2:
                    this.mat = true;
                    this.fn = 'uniformMatrix2fv';
                    this.Constructor = Float32Array;
                    break;
                case this.CONST.FLOAT_VEC4:
                    this.fn = 'uniform4fv';
                    break;
                case this.CONST.FLOAT_VEC3:
                    this.fn = 'uniform3fv';
                    break;
                case this.CONST.FLOAT_VEC2:
                    this.fn = 'uniform2fv';
                    break;
                case this.CONST.FLOAT:
                    this.fn = 'uniform1f';
                    break;
                case this.CONST.SAMPLER_2D:
                    this.fn = 'uniform1i';
                    break;
            }

            this.GLName = options.GLName;
            this.type = options.type;
            this.__data = options.data;

        },

        create: function( program ){

            var GL = this.__GL = program.GL;
            this.program = program;

            this.location = GL.getUniformLocation( program.GLProgram, this.GLName );

        },

        setData: function( data ){

            if( this.dirty ){

                if( this.type === this.CONST.TEXTURE_2D ){

                }else{

                    data = this.data = data || this.data;

                }

                if( this.mat ){
                    this.GL[this.fn]( this.location, false, new this.Constructor( data ) );
                }else{
                    this.GL[this.fn]( this.location, data )
                }

                this.dirty = false;

            }


        }

    } );

    return Uniform;

} );
define( [ 'Base' ], function ( Base ) {

    var Material = Base.extend( {

        defaults: Base._.extend( { }, Base.prototype.defaults ),

        initialize: function( options, pass ){

            Material.super.initialize.call( this, options );

            this.values = {};
            this.pass = pass;

        },

        initOptions: function( options ){

            Material.super.initOptions.call( this, options );

        },

        addValue: function( name, value ){

            this.values[ name ] == undefined && ( this.values[ name ] = {
                value: value,
                dirty: true
            } );

        },

        setValue: function( name, value ){

            if( this.values.hasOwnProperty( name ) ){
                this.values[ name ] = {
                    value: value,
                    dirty: true
                };
            }

        },

        render: function( ){
            var pass = this.pass;
            Base._.each( this.values, function( value, name ){

                if( value.dirty ){
                    pass.find( name ).data = value.value;
                }

            } );
        }

    } );

    return Material;

} );
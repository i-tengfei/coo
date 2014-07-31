define( [ 'Base', 'CONST', 'Texture', 'Uniform', 'Material', 'Geometry', 'Attribute', 'Vec3', 'Mesh', 'PerspectiveCamera', 'Node', 'Mat4', 'Scene', 'Program', 'Pass' ], function ( Base, CONST, Texture, Uniform, Material, Geometry, Attribute, Vec3, Mesh, PerspectiveCamera, Node, Mat4, Scene, Program, Pass ) {

    var _ = Base._;

    var semanticAttributeMap = {
        'NORMAL' : 'normal',
        'POSITION' : 'position',
        'TEXCOORD_0' : 'texcoord0',
        'WEIGHT' : 'weight',
        'JOINT' : 'joint',
        'COLOR' : 'color'
    };

    var GLTFParser = Base.extend( {

        defaults: _.extend( {

        }, Base.prototype.defaults ),

        initialize: function( options ){
            GLTFParser.super.initialize.call( this, options );
        },

        initOptions: function( options ){
            
        },

        parse: function( data ){

            this.data = data;

            this.programs   = this.parsePrograms( );
            this.textures   = this.parseTextures( );
            this.passes     = this.parsePasses( );
            this.cameras    = this.parseCameras( );
            this.materials  = this.parseMaterials( );

            this.meshes     = this.parseMeshes( );
            this.nodes      = this.parseNodes( );
            this.scenes     = this.parseScenes( );

            this.scene      = this.scenes[ data.scene ];

        },

        parsePasses: function( ){

            var data = this.data,
                passes = {};

            var textures = this.textures,
                programs = this.programs;

            // TODO: 支持多Techniques多Pass
            _.each( data.techniques, function( techniqueInfo, name ){

                var parameters = techniqueInfo.parameters;

                var ps = {};

                _.each( techniqueInfo.passes, function( passInfo, name ){

                    var pass = new Pass( {},
                        programs[ passInfo.instanceProgram.program 
                    ] );
                    pass._parameters = parameters;

                    _.each( passInfo.instanceProgram.uniforms, function( name, GLName ){

                        var parameterInfo = parameters[ name ],
                            type = parameterInfo.type;

                        // 跟随系统的uniforms
                        if( parameterInfo.semantic ){
                            var typeUniform;
                            switch( parameterInfo.semantic ){
                                case 'MODELVIEW':
                                    typeUniform = 'modelViewMatrixUniform';
                                    break;
                                case 'MODELVIEWINVERSETRANSPOSE':
                                    typeUniform = 'normalMatrixUniform'
                                    break;
                                case 'PROJECTION':
                                    typeUniform = 'projectionMatrixUniform'
                                    break;
                                default:
                                    console.warn( semantic + ' 暂不支持' );
                                    break;
                            }
                            pass[ typeUniform ] = new Uniform( {
                                name: name,
                                GLName: GLName,
                                type: type
                            } );
                        // 链接到灯光等
                        }else if( parameterInfo.source ){
                            pass.addUniform( new Uniform( {
                                name: name,
                                GLName: GLName,
                                type: type,
                                data: data.nodes[ parameterInfo.source ].matrix
                            } ) );
                        // 自带value
                        }else if( parameterInfo.value ){
                            pass.addUniform( new Uniform( {
                                name: name,
                                GLName: GLName,
                                type: type,
                                data: parameterInfo.value
                            } ) );
                        // 材质 uniforms
                        }else{
                            pass.addUniform( new Uniform( {
                                name: name,
                                GLName: GLName,
                                type: type
                            } ) );
                        }

                    } );

                    _.each( passInfo.instanceProgram.attributes, function( name, GLName ){

                        var parameterInfo = parameters[ name ],
                            type = parameterInfo.type;

                        if( parameterInfo.semantic ){
                            var typeAttribute;
                            switch( parameterInfo.semantic ){
                                case 'NORMAL':
                                    typeAttribute = 'normalAttribute'
                                    break;
                                case 'POSITION':
                                    typeAttribute = 'vertexAttribute'
                                    break;
                                case 'TEXCOORD_0':
                                    typeAttribute = 'texcoordAttribute'
                                    break;
                                default:
                                    console.warn( semantic + ' 暂不支持' );
                                    break;
                            }

                            pass[ typeAttribute ] = new Attribute( {
                                name: name,
                                GLName: GLName,
                                type: type
                            } );
                        }


                    } );

                    ps[ name ] = pass;

                } );

                passes[ name ] = ps[ techniqueInfo.pass ];

            } );

            return passes;

        },

        parsePrograms: function( ){

            var data = this.data,
                programs = {};

            _.each( data.programs, function( programInfo, name ){

                programs[ name ] = new Program( {
                    vertexSource: data.resources.shaders[ programInfo.vertexShader ].data,
                    fragmentSource: data.resources.shaders[ programInfo.fragmentShader ].data
                } );

            } );

            return programs;

        },

        parseScenes: function( ){

            var data = this.data,
                scenes = {};

            var nodes = this.nodes;

            function addNode( node, children ){

                node.add( _.map( children, function( name ){

                    var n = nodes[ name ];

                    if( n._children.length ){
                        addNode( n, n._children );
                        delete n._children;
                    }

                    return n;

                } ) );


            }

            _.each( data.scenes, function( sceneInfo, name ){

                var scene = new Scene( );

                addNode( scene, sceneInfo.nodes );

                scenes[ name ] = scene;

            } );

            return scenes;

        },

        parseNodes: function( ){

            var data = this.data,
                nodes = {};

            var cameras = this.cameras,
                meshes = this.meshes;

            _.each( data.nodes, function( nodeInfo, name ){

                var node;

                if( nodeInfo.camera ){

                    node = cameras[ nodeInfo.camera ];

                }else if( nodeInfo.light ){

                    node = new Node( {
                        name: nodeInfo.name
                    } );

                }else if( nodeInfo.meshes ){
                    
                    node = new Node( {
                        name: nodeInfo.name
                    } );

                    node.add( _.map( nodeInfo.meshes, function( name ){

                        var mesh = meshes[ name ];
                        return mesh.parent ? mesh.clone( ) : mesh;

                    } ) );

                }else{
                    node = new Node( {
                        name: nodeInfo.name
                    } );
                }

                node.decomposeMatrix( node.localMatrix.valGL( nodeInfo.matrix ) );

                node._children = nodeInfo.children;
                nodes[ name ] = node;

            } );

            return nodes;

        },

        parseMeshes: function( ){

            var data = this.data,
                meshes = {};

            var materials = this.materials;

            _.each( data.meshes, function( meshInfo, name ){
                
                var geometries = _.map( meshInfo.primitives, function( primitiveInfo ){

                    var material = materials[ primitiveInfo.material ],
                        indicesInfo = data.accessors[ primitiveInfo.indices ];
                    
                    var bufferViewInfo = data.bufferViews[ indicesInfo.bufferView ],
                        buffer = data.resources.buffers[ bufferViewInfo.buffer ].data,
                        byteOffset = bufferViewInfo.byteOffset + indicesInfo.byteOffset;

                    var geometry = new Geometry( {
                        name: meshInfo.name,
                        faces: new Uint16Array( buffer, byteOffset, indicesInfo.count ),
                        indexCount: indicesInfo.count
                    }, material.pass );


                    if( meshInfo.name === 'geometry51' ){
                        console.log( meshInfo )
                    }


                    _.each( primitiveInfo.attributes, function( accessorName, flag ){

                        var v = _.find( material.pass._parameters, function( x, n ){
                            x.name = n;
                            return x.semantic === flag
                        } );

                        if( !v ) return;

                        var type = v.type,
                            name = v.name;

                        var attributeInfo = data.accessors[ accessorName ],
                            // attributeType = attributeInfo.type,
                            bufferViewInfo = data.bufferViews[ attributeInfo.bufferView ],
                            buffer = data.resources.buffers[ bufferViewInfo.buffer ].data,
                            byteOffset = bufferViewInfo.byteOffset + attributeInfo.byteOffset;

                        var attribute = material.pass.find( name );

                        attribute.type = type;
                        attribute.data = buffer;
                        attribute.offset = byteOffset;
                        attribute.stride = attributeInfo.byteStride;
                        attribute.count = attributeInfo.count;
                        attribute.max = Vec3( attributeInfo.max );
                        attribute.min = Vec3( attributeInfo.min );

                    } );

                    return {
                        geometry: geometry,
                        material: material
                    };

                } );

                if( geometries.length === 1 ){
                    meshes[ name ] = new Mesh( {
                            name: meshInfo.name
                        }, geometries[ 0 ].geometry, geometries[ 0 ].material );
                }else if( geometries.length > 1 ){

                    var node = new Node( {
                        name: meshInfo.name
                    } );
                    node.add( _.map( geometries, function( g ){
                        return new Mesh( {}, g.geometry, g.material )
                    } ) );

                    meshes[ name ] = node;

                }

            } );

            _.each( materials, function( x ){

                delete x.pass._parameters;

            } );

            return meshes;

        },

        parseMaterials: function( ){

            var materials = {};

            var passes = this.passes;

            _.each( this.data.materials, function( materialInfo, name ){

                var instanceTechniqueInfo = materialInfo.instanceTechnique,
                    pass = passes[ instanceTechniqueInfo.technique ];

                var material = new Material( {
                    name: materialInfo.name
                }, pass );

                _.each( instanceTechniqueInfo.values, function( value, name ){

                    material.addValue( name, value );

                } );

                materials[ name ] = material;

            } );

            return materials;

        },

        parseTextures: function( ){

            var data = this.data,
                textures = {};

            _.each( data.textures, function( textureInfo, name ){
                
                var samplerInfo = data.samplers[ textureInfo.sampler ];
                var options = {
                    name: name
                };
                _.each( [ 'wrapS', 'wrapT', 'magFilter', 'minFilter' ], function( name ){
                    var value = samplerInfo[ name ];
                    if( value !== undefined ){
                        if ( typeof( value ) === 'string' ) {
                            value = CONST[ value ];
                        }
                        options[ name ] = value;
                    }
                } );

                var target = textureInfo.target,
                    format = textureInfo.format;
                if( typeof( target ) === 'string' ){
                    target = CONST[ target ];
                    format = CONST[ format ];
                }
                options.format = format;

                if ( target === CONST.TEXTURE_2D ) {

                    var texture = new Texture( options, data.resources.images[ textureInfo.source ].data );

                    textures[ name ] = {
                        data: texture
                    };

                } else if( target === glenum.TEXTURE_CUBE_MAP ) {

                }

            } );
            
            return textures;

        },

        parseCameras: function( ){

            var data = this.data,
                cameras = {};

            _.each( data.cameras, function( cameraInfo, name ){

                switch( cameraInfo.type ){
                    case 'perspective':
                        var perspective = cameraInfo.perspective;
                        cameras[ name ] = new PerspectiveCamera( {
                            fov: perspective.yfov,
                            aspect: perspective.aspect_ratio,
                            near: perspective.znear,
                            far: perspective.zfar
                        } )
                        break;
                }


            } );

            return cameras;

        }

    } );

    return GLTFParser;

} );
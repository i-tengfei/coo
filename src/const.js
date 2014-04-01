define( function( ) {

    return {

        /* ClearBufferMask */
        DEPTH_BUFFER_BIT:               256,
        STENCIL_BUFFER_BIT:             1024,
        COLOR_BUFFER_BIT:               16384,

        /* BeginMode */
        POINTS:                         0,
        LINES:                          1,
        LINE_LOOP:                      2,
        LINE_STRIP:                     3,
        TRIANGLES:                      4,
        TRIANGLE_STRIP:                 5,
        TRIANGLE_FAN:                   6,

        /* BlendingFactorDest */
        ZERO:                           0,
        ONE:                            1,
        SRC_COLOR:                      768,
        ONE_MINUS_SRC_COLOR:            769,
        SRC_ALPHA:                      770,
        ONE_MINUS_SRC_ALPHA:            771,
        DST_ALPHA:                      772,
        ONE_MINUS_DST_ALPHA:            773,

        /* BlendingFactorSrc */
        DST_COLOR:                      774,
        ONE_MINUS_DST_COLOR:            775,
        SRC_ALPHA_SATURATE:             776,

        /* BlendEquationSeparate */
        FUNC_ADD:                       32774,
        BLEND_EQUATION:                 32777,
        BLEND_EQUATION_RGB:             32777,
        BLEND_EQUATION_ALPHA:           34877,

        /* BlendSubtract */
        FUNC_SUBTRACT:                  32778,
        FUNC_REVERSE_SUBTRACT:          32779,

        /* Separate Blend Functions */
        BLEND_DST_RGB:                  32968,
        BLEND_SRC_RGB:                  32969,
        BLEND_DST_ALPHA:                32970,
        BLEND_SRC_ALPHA:                32971,
        CONSTANT_COLOR:                 32769,
        ONE_MINUS_CONSTANT_COLOR:       32770,
        CONSTANT_ALPHA:                 32771,
        ONE_MINUS_CONSTANT_ALPHA:       32772,
        BLEND_COLOR:                    32773,

        /* Buffer Objects */
        ARRAY_BUFFER:                   34962,
        ELEMENT_ARRAY_BUFFER:           34963,
        ARRAY_BUFFER_BINDING:           34964,
        ELEMENT_ARRAY_BUFFER_BINDING:   34965,

        STREAM_DRAW:                    35040,
        STATIC_DRAW:                    35044,
        DYNAMIC_DRAW:                   35048,

        BUFFER_SIZE:                    34660,
        BUFFER_USAGE:                   34661,

        CURRENT_VERTEX_ATTRIB:          34342,

        /* CullFaceMode */
        FRONT:                          1028,
        BACK:                           1029,
        FRONT_AND_BACK:                 1032,

        /* TEXTURE_2D */
        CULL_FACE:                      2884,
        BLEND:                          3042,
        DITHER:                         3024,
        STENCIL_TEST:                   2960,
        DEPTH_TEST:                     2929,
        SCISSOR_TEST:                   3089,
        POLYGON_OFFSET_FILL:            32823,
        SAMPLE_ALPHA_TO_COVERAGE:       32926,
        SAMPLE_COVERAGE:                32928,

        /* ErrorCode */
        NO_ERROR:                       0,
        INVALID_ENUM:                   1280,
        INVALID_VALUE:                  1281,
        INVALID_OPERATION:              1282,
        OUT_OF_MEMORY:                  1285,

        /* FrontFaceDirection */
        CW:                             2304,
        CCW:                            2305,

        /* TextureTarget */
        TEXTURE_2D:                     3553,
        TEXTURE:                        5890

    };

} );
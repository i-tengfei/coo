define( [ 'Class', 'Events', 'underscore' ], function( Class, Events, _ ) {
    
    // Base
    // -----------------
    // Thanks to:
    //  - https://github.com/aralejs/base/blob/master/src/base.js

    var Base = Class.create( {

        Statics: {
            _: _
        },

        Implements: [ Events, {
            before: function( methodName, callback, context ){
                return weave.call(this, 'before', methodName, callback, context);
            },
            after: function( methodName, callback, context ) {
                return weave.call(this, 'after', methodName, callback, context);
            }
        }, {
            initAttrs: function( config ){
                var attrs = this.attrs = {};
                var specialProps = this.propsInAttrs || [];
                mergeInheritedAttrs(attrs, this, specialProps);
                if (config) {
                    mergeUserValue(attrs, config);
                }
                setSetterAttrs( this, attrs, config );
                parseEventsFromAttrs( this, attrs );
                copySpecialProps( specialProps, this, attrs, true );
            },
            get: function( key ){
                var attr = this.attrs[key] || {};
                var val = attr.value;
                return attr.getter ? attr.getter.call(this, val, key) : val;
            },
            set: function( key, val, options ){
                var attrs = {};

                if (isString(key)) {
                    attrs[key] = val;
                } else {
                    attrs = key;
                    options = val;
                }

                options || (options = {});
                var silent = options.silent;
                var override = options.override;

                var now = this.attrs;
                var changed = this.__changedAttrs || (this.__changedAttrs = {});

                for (key in attrs) {
                    if (!attrs.hasOwnProperty(key)) continue;

                    var attr = now[key] || (now[key] = {});
                    val = attrs[key];

                    if (attr.readOnly) {
                        throw new Error('This attribute is readOnly: ' + key);
                    }

                    // invoke setter
                    if (attr.setter) {
                        val = attr.setter.call(this, val, key);
                    }

                    // 获取设置前的 prev 值
                    var prev = this.get(key);

                    // 获取需要设置的 val 值
                    // 如果设置了 override 为 true，表示要强制覆盖，就不去 merge 了
                    // 都为对象时，做 merge 操作，以保留 prev 上没有覆盖的值
                    if (!override && isPlainObject(prev) && isPlainObject(val)) {
                        val = merge(merge({}, prev), val);
                    }

                    // set finally
                    now[key].value = val;

                    // invoke change event
                    // 初始化时对 set 的调用，不触发任何事件
                    if (!this.__initializingAttrs && !isEqual(prev, val)) {
                        if (silent) {
                            changed[key] = [val, prev];
                        }else {
                            this.trigger('change:' + key, val, prev, key);
                        }
                    }
                }

                return this;
            },
            change: function( ){
                var changed = this.__changedAttrs;

                if ( changed ) {
                    for ( var key in changed ) {
                        if ( changed.hasOwnProperty( key ) ) {
                            var args = changed[key];
                            this.trigger('change:' + key, args[0], args[1], key);
                        }
                    }
                    delete this.__changedAttrs;
                }

                return this;
            },
            _isPlainObject: isPlainObject

        } ],

        initialize: function( config ){
            this.initAttrs( config );
            parseEventsFromInstance( this, this.attrs );
        },

        destroy: function( ){
            this.off( );
            for ( var p in this ) {
                if (this.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            this.destroy = function() {};
        }

    } );

    function parseEventsFromInstance( host, attrs ) {
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                var m = '_onChange' + ucfirst(attr);
                if ( host[m] ) {
                    host.on( 'change:' + attr, host[m] );
                }
            }
        }
    }

    function ucfirst(str) {
        return str.charAt(0).toUpperCase() + str.substring(1);
    }


    var toString = Object.prototype.toString;
    var hasOwn = Object.prototype.hasOwnProperty;

    var iteratesOwnLast;
    ( function() {
        var props = [];
        function Ctor() { this.x = 1; }
        Ctor.prototype = { 'valueOf': 1, 'y': 1 };
        for (var prop in new Ctor()) { props.push(prop); }
        iteratesOwnLast = props[0] !== 'x';
    }( ) );

    var isArray = Array.isArray || function(val) {
        return toString.call(val) === '[object Array]';
    };

    function isString(val) {
        return toString.call(val) === '[object String]';
    }

    function isFunction(val) {
        return toString.call(val) === '[object Function]';
    }

    function isWindow(o) {
        return o != null && o == o.window;
    }

    function isPlainObject(o) {
        if (!o || toString.call(o) !== "[object Object]" || o.nodeType || isWindow(o)) {
            return false;
        }

        try {
            if (o.constructor && !hasOwn.call(o, "constructor") && !hasOwn.call(o.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
        } catch (e) {
            return false;
        }

        var key;

        if (iteratesOwnLast) {
            for (key in o) {
                return hasOwn.call(o, key);
            }
        }

        for (key in o) {}

        return key === undefined || hasOwn.call(o, key);
    }

    function isEmptyObject(o) {
        if (!o || toString.call(o) !== "[object Object]" || o.nodeType || isWindow(o) || !o.hasOwnProperty) {
            return false;
        }

        for (var p in o) {
            if (o.hasOwnProperty(p)) return false;
        }
        return true;
    }

    function merge(receiver, supplier) {
        var key, value;

        for (key in supplier) {
            if (supplier.hasOwnProperty(key)) {
                receiver[key] = cloneValue(supplier[key], receiver[key]);
            }
        }

        return receiver;
    }

    // 只 clone 数组和 plain object，其他的保持不变
    function cloneValue(value, prev){
        if (isArray(value)) {
            value = value.slice();
        } else if (isPlainObject(value)) {
            isPlainObject(prev) || (prev = {});

            value = merge(prev, value);
        }

        return value;
    }

    var keys = Object.keys;

    if (!keys) {
        keys = function(o) {
            var result = [];

            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name);
                }
            }
            return result;
        };
    }

    function mergeInheritedAttrs(attrs, instance, specialProps) {
        var inherited = [];
        var proto = instance.constructor.prototype;

        while (proto) {
            // 不要拿到 prototype 上的
            if (!proto.hasOwnProperty('attrs')) {
                proto.attrs = {};
            }

            // 将 proto 上的特殊 properties 放到 proto.attrs 上，以便合并
            copySpecialProps(specialProps, proto.attrs, proto);

            // 为空时不添加
            if (!isEmptyObject(proto.attrs)) {
                inherited.unshift(proto.attrs);
            }

            // 向上回溯一级
            proto = proto.constructor.super;
        }

        // Merge and clone default values to instance.
        for (var i = 0, len = inherited.length; i < len; i++) {
            mergeAttrs(attrs, normalize(inherited[i]));
        }
    }

    function mergeUserValue(attrs, config) {
        mergeAttrs(attrs, normalize(config, true), true);
    }

    function copySpecialProps(specialProps, receiver, supplier, isAttr2Prop) {
        for (var i = 0, len = specialProps.length; i < len; i++) {
            var key = specialProps[i];

            if (supplier.hasOwnProperty(key)) {
                receiver[key] = isAttr2Prop ? receiver.get(key) : supplier[key];
            }
        }
    }


    var EVENT_PATTERN = /^(on|before|after)([A-Z].*)$/;
    var EVENT_NAME_PATTERN = /^(Change)?([A-Z])(.*)/;

    function parseEventsFromAttrs(host, attrs) {
        for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                var value = attrs[key].value, m;

                if (isFunction(value) && (m = key.match(EVENT_PATTERN))) {
                    host[m[1]](getEventName(m[2]), value);
                    delete attrs[key];
                }
            }
        }
    }

    // Converts `Show` to `show` and `ChangeTitle` to `change:title`
    function getEventName(name) {
        var m = name.match(EVENT_NAME_PATTERN);
        var ret = m[1] ? 'change:' : '';
        ret += m[2].toLowerCase() + m[3];
        return ret;
    }


    function setSetterAttrs(host, attrs, config) {
        var options = { silent: true };
        host.__initializingAttrs = true;

        for (var key in config) {
            if (config.hasOwnProperty(key)) {
                if (attrs[key].setter) {
                    host.set(key, config[key], options);
                }
            }
        }

        delete host.__initializingAttrs;
    }


    var ATTR_SPECIAL_KEYS = ['value', 'getter', 'setter', 'readOnly'];

    // normalize `attrs` to
    //
    //   {
    //      value: 'xx',
    //      getter: fn,
    //      setter: fn,
    //      readOnly: boolean
    //   }
    //
    function normalize(attrs, isUserValue) {
        var newAttrs = {};

        for (var key in attrs) {
            var attr = attrs[key];

            if (!isUserValue && isPlainObject(attr) && hasOwnProperties(attr, ATTR_SPECIAL_KEYS)) {
                newAttrs[key] = attr;
                continue;
            }

            newAttrs[key] = {
                value: attr
            };
        }

        return newAttrs;
    }

    var ATTR_OPTIONS = ['setter', 'getter', 'readOnly'];
    // 专用于 attrs 的 merge 方法
    function mergeAttrs(attrs, inheritedAttrs, isUserValue){
        var key, value;
        var attr;

        for (key in inheritedAttrs) {
            if (inheritedAttrs.hasOwnProperty(key)) {
                value = inheritedAttrs[key];
                attr = attrs[key];

                if (!attr) {
                    attr = attrs[key] = {};
                }

                // 从严谨上来说，遍历 ATTR_SPECIAL_KEYS 更好
                // 从性能来说，直接 人肉赋值 更快
                // 这里还是选择 性能优先

                // 只有 value 要复制原值，其他的直接覆盖即可
                (value['value'] !== undefined) && (attr['value'] = cloneValue(value['value'], attr['value']));

                // 如果是用户赋值，只要考虑value
                if (isUserValue) continue;

                for (var i in ATTR_OPTIONS) {
                    var option = ATTR_OPTIONS[i];
                    if (value[option] !== undefined) {
                        attr[option] = value[option];
                    }
                }
            }
        }

        return attrs;
    }

    function hasOwnProperties(object, properties) {
        for (var i = 0, len = properties.length; i < len; i++) {
            if (object.hasOwnProperty(properties[i])) {
                return true;
            }
        }
        return false;
    }


    // 对于 attrs 的 value 来说，以下值都认为是空值： null, undefined, '', [], {}
    function isEmptyAttrValue(o) {
        return o == null || // null, undefined
        (isString(o) || isArray(o)) && o.length === 0 || // '', []
        isEmptyObject(o); // {}
    }

    // 判断属性值 a 和 b 是否相等，注意仅适用于属性值的判断，非普适的 === 或 == 判断。
    function isEqual(a, b) {
        if (a === b) return true;

        if (isEmptyAttrValue(a) && isEmptyAttrValue(b)) return true;

        // Compare `[[Class]]` names.
        var className = toString.call(a);
        if (className != toString.call(b)) return false;

        switch (className) {

            // Strings, numbers, dates, and booleans are compared by value.
            case '[object String]':
            // Primitives and their corresponding object wrappers are
            // equivalent; thus, `"5"` is equivalent to `new String("5")`.
            return a == String(b);

            case '[object Number]':
            // `NaN`s are equivalent, but non-reflexive. An `equal`
            // comparison is performed for other numeric values.
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);

            case '[object Date]':
            case '[object Boolean]':
            // Coerce dates and booleans to numeric primitive values.
            // Dates are compared by their millisecond representations.
            // Note that invalid dates with millisecond representations
            // of `NaN` are not equivalent.
            return +a == +b;

            // RegExps are compared by their source patterns and flags.
            case '[object RegExp]':
            return a.source == b.source &&
            a.global == b.global &&
            a.multiline == b.multiline &&
            a.ignoreCase == b.ignoreCase;

            // 简单判断数组包含的 primitive 值是否相等
            case '[object Array]':
            var aString = a.toString();
            var bString = b.toString();

            // 只要包含非 primitive 值，为了稳妥起见，都返回 false
            return aString.indexOf('[object') === -1 &&
            bString.indexOf('[object') === -1 &&
            aString === bString;
        }

        if (typeof a != 'object' || typeof b != 'object') return false;

        // 简单判断两个对象是否相等，只判断第一层
        if (isPlainObject(a) && isPlainObject(b)) {

            // 键值不相等，立刻返回 false
            if (!isEqual(keys(a), keys(b))) {
                return false;
            }

            // 键相同，但有值不等，立刻返回 false
            for (var p in a) {
                if (a[p] !== b[p]) return false;
            }

            return true;
        }

        // 其他情况返回 false, 以避免误判导致 change 事件没发生
        return false;
    }

    var eventSplitter = /\s+/;

    function weave(when, methodName, callback, context) {
        var names = methodName.split(eventSplitter);
        var name, method;

        while (name = names.shift()) {
            method = getMethod(this, name);
            if (!method.__isAspected) {
                wrap.call(this, name);
            }
            this.on(when + ':' + name, callback, context);
        }

        return this;
    }


    function getMethod(host, methodName) {
        var method = host[methodName];
        if (!method) {
            throw new Error('Invalid method name: ' + methodName);
        }
        return method;
    }


    function wrap(methodName) {
        var old = this[methodName];

        this[methodName] = function() {
            var args = Array.prototype.slice.call(arguments);
            var beforeArgs = ['before:' + methodName].concat(args);

            // prevent if trigger return false
            if (this.trigger.apply(this, beforeArgs) === false) return;

            var ret = old.apply(this, arguments);
            var afterArgs = ['after:' + methodName, ret].concat(args);
            this.trigger.apply(this, afterArgs);

            return ret;
        };

        this[methodName].__isAspected = true;
    }

    return Base;

} )
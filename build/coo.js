define( 'Class',[],function ( ) {
    
    // Class
    // -----------------
    // Thanks to:
    //  - https://github.com/aralejs/class/blob/master/src/class.js

    function Class( o ) {

        if ( !( this instanceof Class ) && isFunction( o ) ) {
            return classify( o )
        }

    }


    Class.create = function( parent, properties ) {

        if ( !isFunction( parent ) ) {
            properties = parent
            parent = null
        }

        properties || ( properties = {} )
        parent || ( parent = properties.Extends || Class )
        properties.Extends = parent

        function SubClass( ) {
            
            parent.apply( this, arguments )
            if ( this.constructor === SubClass && this.initialize ) {
                this.initialize.apply( this, arguments )
            }

        }

        if ( parent !== Class ) {
            mix( SubClass, parent, parent.StaticsWhiteList )
        }

        implement.call( SubClass, properties )

        return classify( SubClass )
    }


    function implement( properties ) {
        var key, value

        for ( key in properties ) {
            value = properties[ key ]

            if ( Class.Mutators.hasOwnProperty( key ) ) {
                Class.Mutators[ key ].call( this, value )
            } else {
                this.prototype[ key ] = value
            }
        }
    }


    Class.extend = function( properties ) {
        properties || ( properties = {} )
        properties.Extends = this

        return Class.create( properties )
    }


    function classify( cls ) {
        cls.extend = Class.extend
        cls.implement = implement
        return cls
    }


    Class.Mutators = {

        'Extends': function( parent ) {
            var existed = this.prototype
            var proto = createProto( parent.prototype )

            mix( proto, existed )

            proto.constructor = this

            this.prototype = proto

            this.super = parent.prototype
        },

        'Implements': function( items ) {
            isArray( items ) || ( items = [ items ] )
            var proto = this.prototype, item

            while ( item = items.shift( ) ) {
                mix( proto, item.prototype || item )
            }
        },

        'Statics': function( staticProperties ) {
            mix( this, staticProperties )
        }

    }


    function Ctor( ) {
    }

    var createProto = Object.__proto__ ?
    function( proto ) {
        return { __proto__: proto }
    } :
    function( proto ) {
        Ctor.prototype = proto
        return new Ctor( )
    }


    function mix( r, s, wl ) {

        for ( var p in s ) {
            if ( s.hasOwnProperty( p ) ) {
                if ( wl && indexOf( wl, p ) === -1 ) continue

                if ( p !== 'prototype' ) {
                    r[ p ] = s[ p ]
                }
            }
        }

    }


    var toString = Object.prototype.toString

    var isArray = Array.isArray || function( val ) {
        return toString.call( val ) === '[object Array]'
    }

    var isFunction = function( val ) {
        return toString.call( val ) === '[object Function]'
    }

    var indexOf = Array.prototype.indexOf ?
    function( arr, item ) {
        return arr.indexOf( item )
    } :
    function( arr, item ) {
        for ( var i = 0, len = arr.length; i < len; i++ ) {
            if ( arr[ i ] === item ) {
                return i
            }
        }
        return -1
    }

    return Class;

} );
define( 'Events',[],function( ) {

    // Events
    // -----------------
    // Thanks to:
    //  - https://github.com/aralejs/events/blob/master/src/events.js

    var eventSplitter = /\s+/

    function Events( ) { }

    Events.prototype.on = function( events, callback, context ) {
        var cache, event, list
        if (!callback) return this

        cache = this.__events || (this.__events = {})
        events = events.split(eventSplitter)

        while (event = events.shift()) {
            list = cache[event] || (cache[event] = [])
            list.push(callback, context)
        }

        return this
    }

    Events.prototype.once = function( events, callback, context ) {
        var that = this
        var cb = function() {
            that.off(events, cb)
            callback.apply(context || that, arguments)
        }
        return this.on(events, cb, context)
    }

    Events.prototype.off = function( events, callback, context ) {
        var cache, event, list, i

        // No events, or removing *all* events.
        if (!(cache = this.__events)) return this
        if (!(events || callback || context)) {
            delete this.__events
            return this
        }

        events = events ? events.split(eventSplitter) : keys(cache)

        // Loop through the callback list, splicing where appropriate.
        while (event = events.shift()) {
            list = cache[event]
            if (!list) continue

            if (!(callback || context)) {
                delete cache[event]
                continue
            }

            for (i = list.length - 2; i >= 0; i -= 2) {
                if (!(callback && list[i] !== callback ||
                context && list[i + 1] !== context)) {
                    list.splice(i, 2)
                }
            }
        }

        return this
    }


    Events.prototype.trigger = function( events ) {
        var cache, event, all, list, i, len, rest = [], args, returned = true;
        if (!(cache = this.__events)) return this

        events = events.split(eventSplitter)

        // Fill up `rest` with the callback arguments.  Since we're only copying
        // the tail of `arguments`, a loop is much faster than Array#slice.
        for (i = 1, len = arguments.length; i < len; i++) {
            rest[i - 1] = arguments[i]
        }

        // For each event, walk through the list of callbacks twice, first to
        // trigger the event, then to trigger any `"all"` callbacks.
        while (event = events.shift()) {
            // Copy callback lists to prevent modification.
            if (all = cache.all) all = all.slice()
            if (list = cache[event]) list = list.slice()

            // Execute event callbacks except one named "all"
            if (event !== 'all') {
                returned = triggerEvents(list, rest, this) && returned
            }

            // Execute "all" callbacks.
            returned = triggerEvents(all, [event].concat(rest), this) && returned
        }

        return returned
    }

    Events.prototype.emit = Events.prototype.trigger

    Events.mixTo = function(receiver) {
        receiver = isFunction(receiver) ? receiver.prototype : receiver
        var proto = Events.prototype

        for (var p in proto) {
            if (proto.hasOwnProperty(p)) {
                receiver[p] = proto[p]
            }
        }
    }


    var keys = Object.keys

    if ( !keys ) {
        keys = function(o) {
            var result = []

            for (var name in o) {
                if (o.hasOwnProperty(name)) {
                    result.push(name)
                }
            }
            return result
        }
    }

    function triggerEvents( list, args, context ) {
        var pass = true

        if (list) {
            var i = 0, l = list.length, a1 = args[0], a2 = args[1], a3 = args[2]
            switch (args.length) {
                case 0: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context) !== false && pass} break;
                case 1: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1) !== false && pass} break;
                case 2: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2) !== false && pass} break;
                case 3: for (; i < l; i += 2) {pass = list[i].call(list[i + 1] || context, a1, a2, a3) !== false && pass} break;
                default: for (; i < l; i += 2) {pass = list[i].apply(list[i + 1] || context, args) !== false && pass} break;
            }
        }
        return pass;
    }

    function isFunction( func ) {
        return Object.prototype.toString.call(func) === '[object Function]'
    }

    return Events

} );
//     Underscore.js 1.6.0
//     http://underscorejs.org
//     (c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    concat           = ArrayProto.concat,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object via a string identifier,
  // for Closure Compiler "advanced" mode.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.6.0';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects with the built-in `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, length = obj.length; i < length; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      var keys = _.keys(obj);
      for (var i = 0, length = keys.length; i < length; i++) {
        if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
      }
    }
    return obj;
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results.push(iterator.call(context, value, index, list));
    });
    return results;
  };

  var reduceError = 'Reduce of empty array with no initial value';

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var length = obj.length;
    if (length !== +length) {
      var keys = _.keys(obj);
      length = keys.length;
    }
    each(obj, function(value, index, list) {
      index = keys ? keys[--length] : --length;
      if (!initial) {
        memo = obj[index];
        initial = true;
      } else {
        memo = iterator.call(context, memo, obj[index], index, list);
      }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var result;
    any(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(predicate, context);
    each(obj, function(value, index, list) {
      if (predicate.call(context, value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, function(value, index, list) {
      return !predicate.call(context, value, index, list);
    }, context);
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(predicate, context);
    each(obj, function(value, index, list) {
      if (!(result = result && predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, predicate, context) {
    predicate || (predicate = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(predicate, context);
    each(obj, function(value, index, list) {
      if (result || (result = predicate.call(context, value, index, list))) return breaker;
    });
    return !!result;
  };

  // Determine if the array or object contains a given value (using `===`).
  // Aliased as `include`.
  _.contains = _.include = function(obj, target) {
    if (obj == null) return false;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    return any(obj, function(value) {
      return value === target;
    });
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      return (isFunc ? method : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matches(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matches(attrs));
  };

  // Return the maximum element or (element-based computation).
  // Can't optimize arrays of integers longer than 65,535 elements.
  // See [WebKit Bug 80797](https://bugs.webkit.org/show_bug.cgi?id=80797)
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.max.apply(Math, obj);
    }
    var result = -Infinity, lastComputed = -Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed > lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
      return Math.min.apply(Math, obj);
    }
    var result = Infinity, lastComputed = Infinity;
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      if (computed < lastComputed) {
        result = value;
        lastComputed = computed;
      }
    });
    return result;
  };

  // Shuffle an array, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var rand;
    var index = 0;
    var shuffled = [];
    each(obj, function(value) {
      rand = _.random(index++);
      shuffled[index - 1] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (obj.length !== +obj.length) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // An internal function to generate lookup iterators.
  var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iterator, context) {
      var result = {};
      iterator = lookupIterator(iterator);
      each(obj, function(value, index) {
        var key = iterator.call(context, value, index, obj);
        behavior(result, key, value);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, key, value) {
    _.has(result, key) ? result[key].push(value) : result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, key, value) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, key) {
    _.has(result, key) ? result[key]++ : result[key] = 1;
  });

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator, context) {
    iterator = lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (obj.length === +obj.length) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[0];
    if (n < 0) return [];
    return slice.call(array, 0, n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N. The **guard** check allows it to work with
  // `_.map`.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array. The **guard** check allows it to work with `_.map`.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if ((n == null) || guard) return array[array.length - 1];
    return slice.call(array, Math.max(array.length - n, 0));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, (n == null) || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, output) {
    if (shallow && _.every(input, _.isArray)) {
      return concat.apply(output, input);
    }
    each(input, function(value) {
      if (_.isArray(value) || _.isArguments(value)) {
        shallow ? push.apply(output, value) : flatten(value, shallow, output);
      } else {
        output.push(value);
      }
    });
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Split an array into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(array, predicate) {
    var pass = [], fail = [];
    each(array, function(elem) {
      (predicate(elem) ? pass : fail).push(elem);
    });
    return [pass, fail];
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iterator, context) {
    if (_.isFunction(isSorted)) {
      context = iterator;
      iterator = isSorted;
      isSorted = false;
    }
    var initial = iterator ? _.map(array, iterator, context) : array;
    var results = [];
    var seen = [];
    each(initial, function(value, index) {
      if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
        seen.push(value);
        results.push(array[index]);
      }
    });
    return results;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(_.flatten(arguments, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.contains(other, item);
      });
    });
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
    return _.filter(array, function(value){ return !_.contains(rest, value); });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var length = _.max(_.pluck(arguments, 'length').concat(0));
    var results = new Array(length);
    for (var i = 0; i < length; i++) {
      results[i] = _.pluck(arguments, '' + i);
    }
    return results;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    if (list == null) return {};
    var result = {};
    for (var i = 0, length = list.length; i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
      if (typeof isSorted == 'number') {
        i = (isSorted < 0 ? Math.max(0, length + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
  };

  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item, from) {
    if (array == null) return -1;
    var hasIndex = from != null;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
      return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
    }
    var i = (hasIndex ? from : array.length);
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(length);

    while(idx < length) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Reusable constructor function for prototype setting.
  var ctor = function(){};

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
      if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
      ctor.prototype = func.prototype;
      var self = new ctor;
      ctor.prototype = null;
      var result = func.apply(self, args.concat(slice.call(arguments)));
      if (Object(result) === result) return result;
      return self;
    };
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
      var position = 0;
      var args = boundArgs.slice();
      for (var i = 0, length = args.length; i < length; i++) {
        if (args[i] === _) args[i] = arguments[position++];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return func.apply(this, args);
    };
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length === 0) throw new Error('bindAll must be passed function names');
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(null, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;
      if (last < wait) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) {
        timeout = setTimeout(later, wait);
      }
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      memo = func.apply(this, arguments);
      func = null;
      return memo;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = arguments;
    return function() {
      var args = arguments;
      for (var i = funcs.length - 1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = new Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = new Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    each(keys, function(key) {
      if (key in obj) copy[key] = obj[key];
    });
    return copy;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj) {
    var copy = {};
    var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
    for (var key in obj) {
      if (!_.contains(keys, key)) copy[key] = obj[key];
    }
    return copy;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      if (source) {
        for (var prop in source) {
          if (obj[prop] === void 0) obj[prop] = source[prop];
        }
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a == 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className != toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, dates, and booleans are compared by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return a == String(b);
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
        // other numeric values.
        return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a == +b;
      // RegExps are compared by their source patterns and flags.
      case '[object RegExp]':
        return a.source == b.source &&
               a.global == b.global &&
               a.multiline == b.multiline &&
               a.ignoreCase == b.ignoreCase;
    }
    if (typeof a != 'object' || typeof b != 'object') return false;
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] == a) return bStack[length] == b;
    }
    // Objects with different constructors are not equivalent, but `Object`s
    // from different frames are.
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) &&
                             _.isFunction(bCtor) && (bCtor instanceof bCtor))
                        && ('constructor' in a && 'constructor' in b)) {
      return false;
    }
    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);
    var size = 0, result = true;
    // Recursively compare objects and arrays.
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = a.length;
      result = size == b.length;
      if (result) {
        // Deep compare the contents, ignoring non-numeric properties.
        while (size--) {
          if (!(result = eq(a[size], b[size], aStack, bStack))) break;
        }
      }
    } else {
      // Deep compare objects.
      for (var key in a) {
        if (_.has(a, key)) {
          // Count the expected number of properties.
          size++;
          // Deep compare each member.
          if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) break;
        }
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        for (key in b) {
          if (_.has(b, key) && !(size--)) break;
        }
        result = !size;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return result;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b, [], []);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (_.has(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) == '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    return obj === Object(obj);
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp.
  each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) == '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return !!(obj && _.has(obj, 'callee'));
    };
  }

  // Optimize `isFunction` if appropriate.
  if (typeof (/./) !== 'function') {
    _.isFunction = function(obj) {
      return typeof obj === 'function';
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj != +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) == '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  _.constant = function(value) {
    return function () {
      return value;
    };
  };

  _.property = function(key) {
    return function(obj) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of `key:value` pairs.
  _.matches = function(attrs) {
    return function(obj) {
      if (obj === attrs) return true; //avoid comparing an object to itself.
      for (var key in attrs) {
        if (attrs[key] !== obj[key])
          return false;
      }
      return true;
    }
  };

  // Run a function **n** times.
  _.times = function(n, iterator, context) {
    var accum = Array(Math.max(0, n));
    for (var i = 0; i < n; i++) accum[i] = iterator.call(context, i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() { return new Date().getTime(); };

  // List of HTML entities for escaping.
  var entityMap = {
    escape: {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;'
    }
  };
  entityMap.unescape = _.invert(entityMap.escape);

  // Regexes containing the keys and values listed immediately above.
  var entityRegexes = {
    escape:   new RegExp('[' + _.keys(entityMap.escape).join('') + ']', 'g'),
    unescape: new RegExp('(' + _.keys(entityMap.unescape).join('|') + ')', 'g')
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  _.each(['escape', 'unescape'], function(method) {
    _[method] = function(string) {
      if (string == null) return '';
      return ('' + string).replace(entityRegexes[method], function(match) {
        return entityMap[method][match];
      });
    };
  });

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property) {
    if (object == null) return void 0;
    var value = object[property];
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result.call(this, func.apply(_, args));
      };
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\t':     't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(text, data, settings) {
    var render;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = new RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset)
        .replace(escaper, function(match) { return '\\' + escapes[match]; });

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      }
      if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      }
      if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }
      index = offset + match.length;
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + "return __p;\n";

    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    if (data) return render(data, _);
    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled function source as a convenience for precompilation.
    template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function, which will delegate to the wrapper.
  _.chain = function(obj) {
    return _(obj).chain();
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(obj) {
    return this._chain ? _(obj).chain() : obj;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name == 'shift' || name == 'splice') && obj.length === 0) delete obj[0];
      return result.call(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result.call(this, method.apply(this._wrapped, arguments));
    };
  });

  _.extend(_.prototype, {

    // Start chaining a wrapped Underscore object.
    chain: function() {
      this._chain = true;
      return this;
    },

    // Extracts the result from a wrapped and chained object.
    value: function() {
      return this._wrapped;
    }

  });

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}).call(this);

define( 'Base',[ 'Class', 'Events', 'underscore' ], function( Class, Events, _ ) {
    
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

} );
define( 'UUID',[ 'Base' ], function ( Base ) {

    var __POOL__ = {};

    var UUID = Base.extend( {

        defaults: {},

        initialize: function( cid, options ){
            
            UUID.super.initialize.call( this );

            this.__UUID = this.makeUUID( );
            this.__defineGetter__( 'UUID', function( ){
                return this.__UUID;
            } );

            if( typeof cid != 'string' && !options ){
                options = cid;
                cid = this.UUID;
            }

            this.__CID = cid;

            this.__defineGetter__( 'CID', function( ){
                return this.__CID;
            } );

            __POOL__[ cid ] = this;

            this.init( UUID._.extend( this.defaults, options ) );

        },

        init: function( options ){
            throw( '必须覆盖UUID:init方法！' );
        },

        find: function( cid ){
            return __POOL__[ cid ];
        },

        destroy: function( ){

            delete __POOL__[ this.CID ];

        },

        makeUUID: function( ){

            var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
            var uuid = new Array(36);
            var rnd = 0, r;

            return function( ){

                for ( var i = 0; i < 36; i ++ ) {

                    if ( i == 8 || i == 13 || i == 18 || i == 23 ) {
                
                        uuid[ i ] = '-';
                
                    } else if ( i == 14 ) {
                
                        uuid[ i ] = '4';
                
                    } else {
                
                        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
                        r = rnd & 0xf;
                        rnd = rnd >> 4;
                        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];

                    }
                }
                
                return uuid.join('');
            }

        }( )

    } );

    return UUID;

} );
define( 'Mat4',[],function ( ) {

    function Mat4( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ){

        if( ! ( this instanceof Mat4 ) ){
            return new Mat4( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 );
        }

        var arr = Array.apply( this, arguments );

        this[ 0  ] = ( arr[ 0 ] !== undefined ) ? arr[ 0 ] : 1;
        this[ 4  ] = arr[ 4  ] || 0;
        this[ 8  ] = arr[ 8  ] || 0;
        this[ 12 ] = arr[ 12 ] || 0;

        this[ 1  ] = arr[ 1  ] || 0;
        this[ 5  ] = ( arr[ 5 ] !== undefined ) ? arr[ 5 ] : 1;
        this[ 9  ] = arr[ 9  ] || 0;
        this[ 13 ] = arr[ 13 ] || 0;

        this[ 2  ] = arr[ 2  ] || 0;
        this[ 6  ] = arr[ 6  ] || 0;
        this[ 10 ] = ( arr[ 10 ] !== undefined ) ? arr[ 10 ] : 1;
        this[ 14 ] = arr[ 14 ] || 0;

        this[ 3  ] = arr[ 3  ] || 0;
        this[ 7  ] = arr[ 7  ] || 0;
        this[ 11 ] = arr[ 11 ] || 0;
        this[ 15 ] = ( arr[ 15 ] !== undefined ) ? arr[ 15 ] : 1;

        this.length = 16;

        for( var i = 1; i < 5; i++ )
        for( var j = 1; j < 5; j++ ){
            var m = '' + i + j,
                n = ( m/10|0 ) + ( m % 10 ) * 4 - 5;
            this.__defineGetter__( 'm' + m, ( function( n ){
                return function( ){
                    return this[ n ];
                }
            } )( n ) );
            this.__defineSetter__( 'm' + m, ( function( n ){
                return function( v ){
                    this[ n ] = v;
                }
            } )( n ) );
        }

        return this;

    }

    Mat4.prototype = new Array( );

    Mat4.prototype.val = function( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ){

        if( typeof m11 === 'number' && typeof m12 === 'number' && typeof m13 === 'number' && typeof m14 === 'number' && 
            typeof m21 === 'number' && typeof m22 === 'number' && typeof m23 === 'number' && typeof m24 === 'number' && 
            typeof m31 === 'number' && typeof m32 === 'number' && typeof m33 === 'number' && typeof m34 === 'number' && 
            typeof m41 === 'number' && typeof m42 === 'number' && typeof m43 === 'number' && typeof m44 === 'number' ){

            this[ 0 ] = m11; this[ 4 ] = m12; this[ 8  ] = m13; this[ 12 ] = m14;
            this[ 1 ] = m21; this[ 5 ] = m22; this[ 9  ] = m23; this[ 13 ] = m24;
            this[ 2 ] = m31; this[ 6 ] = m32; this[ 10 ] = m33; this[ 14 ] = m34;
            this[ 3 ] = m41; this[ 7 ] = m42; this[ 11 ] = m43; this[ 15 ] = m44;

            return this;

        }else if( m11 instanceof Mat4 && m12 === undefined ){

            return this.val(
                m11.m11, m11.m12, m11.m13, m11.m14,
                m11.m21, m11.m22, m11.m23, m11.m24,
                m11.m31, m11.m32, m11.m33, m11.m34,
                m11.m41, m11.m42, m11.m43, m11.m44
            );

        }else{
            return this.val( m11[ 0 ], m11[ 1 ], m11[ 2 ], m11[ 3 ], m11[ 4 ], m11[ 5 ], m11[ 6 ], m11[ 7 ], m11[ 8 ], m11[ 9 ], m11[ 10 ], m11[ 11 ], m11[ 12 ], m11[ 13 ], m11[ 14 ], m11[ 15 ] );
        }

    };

    Mat4.prototype.clone = function( ){

        return new Mat4( ).val( this );

    };

    Mat4.prototype.zero = function( ) {

        for( var i = 0; i < 16; i++ ){
            this[ i ] = 0;
        }

        return this;

    };
    Mat4.prototype.identity = function( ) {

        this.zero( );

        this.m11 = 1;
        this.m22 = 1;
        this.m33 = 1;
        this.m44 = 1;

        return this;

    };
    Mat4.prototype.determinant = function( ){

        var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14;
        var m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24;
        var m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34;
        var m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44;

        return (
            m41 * (
                + m14 * m23 * m32
                - m13 * m24 * m32
                - m14 * m22 * m33
                + m12 * m24 * m33
                + m13 * m22 * m34
                - m12 * m23 * m34
            ) +
            m42 * (
                + m11 * m23 * m34
                - m11 * m24 * m33
                + m14 * m21 * m33
                - m13 * m21 * m34
                + m13 * m24 * m31
                - m14 * m23 * m31
            ) +
            m43 * (
                + m11 * m24 * m32
                - m11 * m22 * m34
                - m14 * m21 * m32
                + m12 * m21 * m34
                + m14 * m22 * m31
                - m12 * m24 * m31
            ) +
            m44 * (
                - m13 * m22 * m31
                - m11 * m23 * m32
                + m11 * m22 * m33
                + m13 * m21 * m32
                - m12 * m21 * m33
                + m12 * m23 * m31
            )

        );

    };
    Mat4.prototype.transpose = function( ) {

        var tmp;

        tmp = this.m21; this.m21 = this.m12; this.m12 = tmp;
        tmp = this.m31; this.m31 = this.m13; this.m13 = tmp;
        tmp = this.m32; this.m32 = this.m23; this.m23 = tmp;

        tmp = this.m41; this.m41 = this.m14; this.m14 = tmp;
        tmp = this.m42; this.m42 = this.m24; this.m24 = tmp;
        tmp = this.m43; this.m43 = this.m34; this.m34 = tmp;

        return this;

    };
    Mat4.prototype.invert = function( m ) {

        if( m ){

            return this.val( m ).invert( );

        }else{

            var m11 = this.m11, m12 = this.m12, m13 = this.m13, m14 = this.m14,
                m21 = this.m21, m22 = this.m22, m23 = this.m23, m24 = this.m24,
                m31 = this.m31, m32 = this.m32, m33 = this.m33, m34 = this.m34,
                m41 = this.m41, m42 = this.m42, m43 = this.m43, m44 = this.m44

            determinant = this.determinant( );

            if( determinant === 0 ) {
                throw( "Matrix determinant is zero, can't invert." );
            }

            this.m11 = m23 * m34 * m42 - m24 * m33 * m42 + m24 * m32 * m43 - m22 * m34 * m43 - m23 * m32 * m44 + m22 * m33 * m44;
            this.m12 = m14 * m33 * m42 - m13 * m34 * m42 - m14 * m32 * m43 + m12 * m34 * m43 + m13 * m32 * m44 - m12 * m33 * m44;
            this.m13 = m13 * m24 * m42 - m14 * m23 * m42 + m14 * m22 * m43 - m12 * m24 * m43 - m13 * m22 * m44 + m12 * m23 * m44;
            this.m14 = m14 * m23 * m32 - m13 * m24 * m32 - m14 * m22 * m33 + m12 * m24 * m33 + m13 * m22 * m34 - m12 * m23 * m34;
            this.m21 = m24 * m33 * m41 - m23 * m34 * m41 - m24 * m31 * m43 + m21 * m34 * m43 + m23 * m31 * m44 - m21 * m33 * m44;
            this.m22 = m13 * m34 * m41 - m14 * m33 * m41 + m14 * m31 * m43 - m11 * m34 * m43 - m13 * m31 * m44 + m11 * m33 * m44;
            this.m23 = m14 * m23 * m41 - m13 * m24 * m41 - m14 * m21 * m43 + m11 * m24 * m43 + m13 * m21 * m44 - m11 * m23 * m44;
            this.m24 = m13 * m24 * m31 - m14 * m23 * m31 + m14 * m21 * m33 - m11 * m24 * m33 - m13 * m21 * m34 + m11 * m23 * m34;
            this.m31 = m22 * m34 * m41 - m24 * m32 * m41 + m24 * m31 * m42 - m21 * m34 * m42 - m22 * m31 * m44 + m21 * m32 * m44;
            this.m32 = m14 * m32 * m41 - m12 * m34 * m41 - m14 * m31 * m42 + m11 * m34 * m42 + m12 * m31 * m44 - m11 * m32 * m44;
            this.m33 = m12 * m24 * m41 - m14 * m22 * m41 + m14 * m21 * m42 - m11 * m24 * m42 - m12 * m21 * m44 + m11 * m22 * m44;
            this.m34 = m14 * m22 * m31 - m12 * m24 * m31 - m14 * m21 * m32 + m11 * m24 * m32 + m12 * m21 * m34 - m11 * m22 * m34;
            this.m41 = m23 * m32 * m41 - m22 * m33 * m41 - m23 * m31 * m42 + m21 * m33 * m42 + m22 * m31 * m43 - m21 * m32 * m43;
            this.m42 = m12 * m33 * m41 - m13 * m32 * m41 + m13 * m31 * m42 - m11 * m33 * m42 - m12 * m31 * m43 + m11 * m32 * m43;
            this.m43 = m13 * m22 * m41 - m12 * m23 * m41 - m13 * m21 * m42 + m11 * m23 * m42 + m12 * m21 * m43 - m11 * m22 * m43;
            this.m44 = m12 * m23 * m31 - m13 * m22 * m31 + m13 * m21 * m32 - m11 * m23 * m32 - m12 * m21 * m33 + m11 * m22 * m33;

            return this.multiply( 1 / determinant );
            
        }

    };



    Mat4.prototype.multiply = function( m1, m2 ) {

        if( m1 instanceof Mat4 && m2 instanceof Mat4 ){

            this.m11 = m1.m11 * m2.m11 + m1.m12 * m2.m21 + m1.m13 * m2.m31 + m1.m14 * m2.m41;
            this.m12 = m1.m11 * m2.m12 + m1.m12 * m2.m22 + m1.m13 * m2.m32 + m1.m14 * m2.m42;
            this.m13 = m1.m11 * m2.m13 + m1.m12 * m2.m23 + m1.m13 * m2.m33 + m1.m14 * m2.m43;
            this.m14 = m1.m11 * m2.m14 + m1.m12 * m2.m24 + m1.m13 * m2.m34 + m1.m14 * m2.m44;

            this.m21 = m1.m21 * m2.m11 + m1.m22 * m2.m21 + m1.m23 * m2.m31 + m1.m24 * m2.m41;
            this.m22 = m1.m21 * m2.m12 + m1.m22 * m2.m22 + m1.m23 * m2.m32 + m1.m24 * m2.m42;
            this.m23 = m1.m21 * m2.m13 + m1.m22 * m2.m23 + m1.m23 * m2.m33 + m1.m24 * m2.m43;
            this.m24 = m1.m21 * m2.m14 + m1.m22 * m2.m24 + m1.m23 * m2.m34 + m1.m24 * m2.m44;

            this.m31 = m1.m31 * m2.m11 + m1.m32 * m2.m21 + m1.m33 * m2.m31 + m1.m34 * m2.m41;
            this.m32 = m1.m31 * m2.m12 + m1.m32 * m2.m22 + m1.m33 * m2.m32 + m1.m34 * m2.m42;
            this.m33 = m1.m31 * m2.m13 + m1.m32 * m2.m23 + m1.m33 * m2.m33 + m1.m34 * m2.m43;
            this.m34 = m1.m31 * m2.m14 + m1.m32 * m2.m24 + m1.m33 * m2.m34 + m1.m34 * m2.m44;

            this.m41 = m1.m41 * m2.m11 + m1.m42 * m2.m21 + m1.m43 * m2.m31 + m1.m44 * m2.m41;
            this.m42 = m1.m41 * m2.m12 + m1.m42 * m2.m22 + m1.m43 * m2.m32 + m1.m44 * m2.m42;
            this.m43 = m1.m41 * m2.m13 + m1.m42 * m2.m23 + m1.m43 * m2.m33 + m1.m44 * m2.m43;
            this.m44 = m1.m41 * m2.m14 + m1.m42 * m2.m24 + m1.m43 * m2.m34 + m1.m44 * m2.m44;

            return this;

        }else if( m1 instanceof Mat4 && m2 === undefined  ){

            return this.multiply( this, m1 );

        }else if( typeof m1 === 'number' && m2 === undefined ){
            
            this.m11 = this.m11 * m1; this.m12 = this.m12 * m1; this.m13 = this.m13 * m1; this.m14 = this.m14 * m1;
            this.m21 = this.m21 * m1; this.m22 = this.m22 * m1; this.m23 = this.m23 * m1; this.m24 = this.m24 * m1;
            this.m31 = this.m31 * m1; this.m32 = this.m32 * m1; this.m33 = this.m33 * m1; this.m34 = this.m34 * m1;
            this.m41 = this.m41 * m1; this.m42 = this.m42 * m1; this.m43 = this.m43 * m1; this.m44 = this.m44 * m1;

            return this;

        }
    
    };



    // ---------- ---------- For Camera ---------- ---------- //
    Mat4.prototype.frustum = function ( left, right, bottom, top, near, far ) {

        var a =  ( right + left )   / ( right - left ),
            b =  ( top + bottom )   / ( top - bottom ),
            c = -( far + near )     / ( far - near   ),
            d = -2 * far * near     / ( far - near   ),
            x =  2 * near           / ( right - left ),
            y =  2 * near           / ( top - bottom );

        return this.val(
            x,  0,  a,  0,
            0,  y,  b,  0,
            0,  0,  c,  d,
            0,  0, -1,  0
        );

    };
    Mat4.prototype.perspective = function ( fov, aspect, near, far ) {

        var ymax = near * Math.tan( fov * Math.PI / 360 );
        var ymin = - ymax;
        var xmin = ymin * aspect;
        var xmax = ymax * aspect;

        return this.frustum( xmin, xmax, ymin, ymax, near, far );

    };
    Mat4.prototype.lookAt = function( eye, target, up ) {

        var x = eye.clone( );
        var y = eye.clone( );
        var z = eye.clone( );

        z.sub( eye, target ).normalize( );

        if ( z.length === 0 ) {

            z.z = 1;

        }

        x.cross( up, z ).normalize( );

        if ( x.length === 0 ) {

            z.x += 0.0001;
            x.cross( up, z ).normalize( );

        }

        y.cross( z, x );

        this.m11 = x.x; this.m12 = y.x; this.m13 = z.x;
        this.m21 = x.y; this.m22 = y.y; this.m23 = z.y;
        this.m31 = x.z; this.m32 = y.z; this.m33 = z.z;

        return this;

    };
    Mat4.prototype.maxScaleOnAxis = function ( ) {

        var scaleXSq = this[ 0 ] * this[ 0 ] + this[ 1 ] * this[ 1 ] + this[ 2  ] * this[ 2  ];
        var scaleYSq = this[ 4 ] * this[ 4 ] + this[ 5 ] * this[ 5 ] + this[ 6  ] * this[ 6  ];
        var scaleZSq = this[ 8 ] * this[ 8 ] + this[ 9 ] * this[ 9 ] + this[ 10 ] * this[ 10 ];

        return Math.sqrt( Math.max( scaleXSq, Math.max( scaleYSq, scaleZSq ) ) );

    };

    Mat4.prototype.setFromQuaternion = function( q ){

        var x = q.x, y = q.y, z = q.z, w = q.w;
        var x2 = x + x, y2 = y + y, z2 = z + z;
        var xx = x * x2, xy = x * y2, xz = x * z2;
        var yy = y * y2, yz = y * z2, zz = z * z2;
        var wx = w * x2, wy = w * y2, wz = w * z2;

        this[0] = 1 - ( yy + zz );
        this[4] = xy - wz;
        this[8] = xz + wy;

        this[1] = xy + wz;
        this[5] = 1 - ( xx + zz );
        this[9] = yz - wx;

        this[2] = xz - wy;
        this[6] = yz + wx;
        this[10] = 1 - ( xx + yy );

        // last column
        this[3] = 0; this[7] = 0; this[11] = 0;

        // bottom row
        this[12] = 0;  this[13] = 0; this[14] = 0; this[15] = 1;

        return this;

    };

    Mat4.prototype.makeScale = function( v ){

        var x = v.x, y = v.y, z = v.z;

        this[0] *= x; this[4] *= y; this[8 ] *= z;
        this[1] *= x; this[5] *= y; this[9 ] *= z;
        this[2] *= x; this[6] *= y; this[10] *= z;
        this[3] *= x; this[7] *= y; this[11] *= z;

        return this;

    };

    Mat4.prototype.setPosition = function( v ){
        this[12] = v.x;
        this[13] = v.y;
        this[14] = v.z;
        return this;
    };

    Mat4.prototype.compose = function( position, rotation, scale ){
        this.setFromQuaternion( rotation.quaternion );
        this.makeScale( scale );
        this.setPosition( position );
        return this;
    };

    Mat4.prototype.identity = function( ) {

        return this.val(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

    };

    return Mat4;

} );
define( 'Vec3',[],function ( ) {

    function Vec3( x, y, z ){

        if( ! ( this instanceof Vec3 ) ){
            return new Vec3( x, y, z );
        }

        var arr = Array.apply( this, arguments );

        if( Array.isArray( x ) && y === undefined ){
            arr = x;
        }

        this[ 0 ] = arr[ 0 ] || 0;
        this[ 1 ] = arr[ 1 ] || 0;
        this[ 2 ] = arr[ 2 ] || 0;

        this.length = 3;

        this.__defineGetter__( 'x', function( ){
            return this[ 0 ];
        } );
        this.__defineSetter__( 'x', function( v ){
            this[ 0 ] = v;
        } );

        this.__defineGetter__( 'y', function( ){
            return this[ 1 ];
        } );
        this.__defineSetter__( 'y', function( v ){
            this[ 1 ] = v;
        } );

        this.__defineGetter__( 'z', function( ){
            return this[ 2 ];
        } );
        this.__defineSetter__( 'z', function( v ){
            this[ 2 ] = v;
        } );

        return this;

    }

    Vec3.prototype = new Array( );

    Vec3.prototype.val = function( x,y,z ){

        if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ){

            this.x = x;
            this.y = y;
            this.z = z;
            
            return this;

        }else if( x instanceof Array && x.length === 3 && y === undefined ){

            return this.val( x[ 0 ], x[ 1 ], x[ 2 ] );

        }

    };

    Vec3.prototype.clone = function( ){
        return Vec3( ).val( this );
    };

    Vec3.prototype.sub = function( x,y,z ){

        if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ){

            this.x = this.x - x;
            this.y = this.y - y;
            this.z = this.z - z;

            return this;

        }else if( x instanceof Vec3 && y instanceof Vec3 && z === undefined ){

            return this.val( x ).sub( y );

        }else if( x instanceof Array && y === undefined  ){

            return this.sub( x[ 0 ], x[ 1 ], x[ 2 ] );

        }

    };

    Vec3.prototype.add = function( x,y,z ){

        if( typeof x === 'number' && typeof y === 'number' && typeof z === 'number' ){

            this.x = this.x + x;
            this.y = this.y + y;
            this.z = this.z + z;

            return this;

        }else if( x instanceof Vec3 && y instanceof Vec3 && z === undefined ){

            return this.val( x ).add( y );

        }else if( x instanceof Array && y === undefined  ){

            return this.add( x[ 0 ], x[ 1 ], x[ 2 ] );

        }

    };

    Vec3.prototype.distanceTo = function ( v ) {

        return Math.sqrt( this.distanceToSquared( v ) );

    };

    Vec3.prototype.distanceToSquared = function ( v ) {
        
        var dx = this.x - v.x, dy = this.y - v.y;
        return dx * dx + dy * dy;

    };

    Vec3.prototype.dot = function( v ){

        return this.x * v.x + this.y * v.y + this.z * v.z;

    };

    Vec3.prototype.cross = function( v1, v2 ){

        if( v1 && v2 ){

            this.x = v1.y * v2.z - v1.z * v2.y;
            this.y = v1.z * v2.x - v1.x * v2.z;
            this.z = v1.x * v2.y - v1.y * v2.x;

            return this;

        }else if( v1 ){

            return this.cross( this, v1 );

        }

    };

    Vec3.prototype.length2 = function( ){

        return this.dot( this );

    };

    Vec3.prototype.length1 = function( ){

        return Math.sqrt( this.length2( ) );
    
    };

    Vec3.prototype.normalize = function( ){

        var len = 1 / ( this.length1( ) || 1 );

        this.x = this.x * len;
        this.y = this.y * len;
        this.z = this.z * len;

        return this;

    };

    return Vec3;

} );
define( 'Quaternion',[],function ( ) {

    function Quaternion( x, y, z, w ){

        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.w = ( w !== undefined ) ? w : 1;

    }

    Quaternion.prototype = {

        setFromRotation: function( v ){
            
            var c1 = Math.cos( v.__x / 2 );
            var c2 = Math.cos( v.__y / 2 );
            var c3 = Math.cos( v.__z / 2 );
            var s1 = Math.sin( v.__x / 2 );
            var s2 = Math.sin( v.__y / 2 );
            var s3 = Math.sin( v.__z / 2 );

            if ( v.order === 'XYZ' ) {

                this.x = s1 * c2 * c3 + c1 * s2 * s3;
                this.y = c1 * s2 * c3 - s1 * c2 * s3;
                this.z = c1 * c2 * s3 + s1 * s2 * c3;
                this.w = c1 * c2 * c3 - s1 * s2 * s3;

            }
            return this;
        },

        setFromAngle: function( axis, angle ){

            var halfAngle = angle / 2,
                s = Math.sin( halfAngle );

            this.x = axis.x * s;
            this.y = axis.y * s;
            this.z = axis.z * s;
            this.w = Math.cos( halfAngle );

            return this;

        }

    };

    return Quaternion;

} );
define( 'Rotation',[ 'Quaternion' ], function ( Quaternion ) {

    function Rotation( x, y, z, order ){

        if( ! ( this instanceof Rotation ) ){
            return new Rotation( x, y, z, order );
        }

        this.__quaternion = new Quaternion( );
        if( Array.isArray( x ) && y === undefined ){
            this.set( x[ 0 ], x[ 1 ], x[ 2 ], 'XYZ' )    
        }else{
            this.set( x||0, y||0, z||0, order||'XYZ' );
        }
    }

    Rotation.prototype = {

        __x: 0, __y: 0, __z: 0, __order: 'XYZ',

        __quaternion: new Quaternion( ),

        __updateQuaternion: function( ){
            this.__quaternion.setFromRotation( this, false );
        },

        updateFromQuaternion: function( ){
            this.setFromQuaternion( this.__quaternion );
        },

        get x( ){
            return this.__x;
        },

        set x( v ){
            this.__x = v;
            this.__updateQuaternion( );
        },

        get y( ){
            return this.__y;
        },

        set y( v ){
            this.__y = v;
            this.__updateQuaternion( );
        },

        get z( ){
            return this.__z;
        },

        set z( v ){
            this.__z = v;
            this.__updateQuaternion( );
        },

        get order( ){
            return this.__order;
        },

        set order( v ){
            this.__order = v;
            this.__updateQuaternion( );
        },

        get quaternion( ){
            return this.__quaternion;
        },

        set: function( x, y, z, order ){
            this.__x = x;
            this.__y = y;
            this.__z = z;
            this.__order = order;
            this.__updateQuaternion( );
        },

        setFromRotationMatrix: function( m, order ){

            order = order || this.__order;

            if ( order === 'XYZ' ) {

                this.__y = Math.asin( clamp( m.m13 ) );

                if ( Math.abs( m.m13 ) < 0.99999 ) {

                    this.__x = Math.atan2( - m.m23, m.m33 );
                    this.__z = Math.atan2( - m.m12, m.m11 );

                } else {

                    this.__x = Math.atan2( m.m32, m.m22 );
                    this.__z = 0;

                }

            }

            this.order = order;

            return this;

        },

        setFromQuaternion: function( q, order ){
            
            var sqx = q.x * q.x;
            var sqy = q.y * q.y;
            var sqz = q.z * q.z;
            var sqw = q.w * q.w;

            order = order || this.order;

            if ( order === 'XYZ' ) {
                this.__x = Math.atan2( 2 * ( q.x * q.w - q.y * q.z ), ( sqw - sqx - sqy + sqz ) );
                this.__y = Math.asin(  clamp( 2 * ( q.x * q.z + q.y * q.w ) ) );
                this.__z = Math.atan2( 2 * ( q.z * q.w - q.x * q.y ), ( sqw + sqx - sqy - sqz ) );
            }

            this.order = order;

            return this;

        },

        setFromAxisAngle: function( axis, angle ){

            this.quaternion.setFromAxisAngle( axis, angle )
            this.updateFromQuaternion( );
            return this;

        }

    };

    function clamp( x ) {
        return Math.min( Math.max( x, -1 ), 1 );
    }

    return Rotation;

} );
define( 'Node',[ 'UUID', 'Mat4', 'Vec3', 'Rotation' ], function ( UUID, Mat4, Vec3, Rotation ) {

    var Node = UUID.extend( {

        defaults: {
            position: [0,0,0],
            rotation: [0,0,0],
            target: [0,0,0],
            scale: [1,1,1],
            up: [0,1,0]
        },

        initialize: function( cid, options ){

            Node.super.initialize.call( this, cid, options );

            this.localMatrix = Mat4( );
            this.worldMatrix = Mat4( );

            this.parent = null;
            this.children = [];

            return this;

        },

        init: function( options ){

            this.position = Vec3( options.position );
            this.rotation = Rotation( options.rotation );
            this.target = Vec3( options.target );
            this.scale = Vec3( options.scale );
            this.up = Vec3( options.up );

        },

        add: function( child ){
            if( arguments.length > 1 ){

                for( var i = 0, il = arguments.length; i < il; i++ ){
                    this.add( arguments[i] );
                }

            }else if( Array.isArray( child ) ){

                for( var i = 0, il = child.length; i < il; i++ ){
                    this.add( child[i] );
                }

            } else if( child instanceof Node ) {

                if( !!child.parent ) {
                    child.parent.remove( child );
                }

                child.parent = this;
                this.children.push( child );

            } else {

                throw( '子对象必须继承于 Node' );

            }
            return this;
        },

        remove: function( child ){
            var ind = this.children.indexOf( child );

            if( ~ind ) {

                this.children.splice( ind, 1 );

            }
            return this;
        },

        updateLocalMatrix: function( ){
            this.localMatrix.compose( this.position, this.rotation, this.scale );
            this.__worldMatrixNeedsUpdate = true;
            return this;
        },

        updateWorldMatrix: function( force ){

            this.updateLocalMatrix( );

            if ( this.__worldMatrixNeedsUpdate || force ) {


                if ( !this.parent ) {

                    this.worldMatrix.val( this.localMatrix );

                } else {

                    this.worldMatrix.multiply( this.parent.worldMatrix, this.localMatrix );

                }

                this.__worldMatrixNeedsUpdate = false;
                force = true;

            }

            for ( var i = 0, l = this.children.length; i < l; i ++ ) {

                this.children[ i ].updateWorldMatrix( force );

            }
            return this;

        }

    } );

    return Node;

} );
define( 'Scene',[ 'Node' ], function ( Node ) {

    var Scene = Node.extend( {

        defaults: Node._.extend( {}, Node.prototype.defaults ),

        initialize: function( cid, options ){
            Scene.super.initialize.call( this, cid, options );
        },

        init: function( options ){
            Node.prototype.init.call( this, options );
        }

    } );

    return Scene;

} );
define( 'Camera',[ 'Node', 'Mat4' ], function( Node, Mat4 ) {

    var Camera = Node.extend( {

        defaults: Node._.extend( {}, Node.prototype.defaults ),

        initialize: function( cid, options ){
            Camera.super.initialize.call( this, cid, options );
            this.projectionMatrix = new Mat4( );
        },
        init: function( options ){
            Node.prototype.init.call( this, options );
        },
        lookAt: function( vector ){

            vector = vector || this.target;
            var tmp = this.localMatrix.clone( );
            tmp.lookAt( this.position, vector, this.up );

            this.rotation.setFromRotationMatrix( tmp );

            return this;

        }

    } );

    return Camera;

} );
define( 'PerspectiveCamera',[ 'Camera' ], function( Camera ) {

    var PerspectiveCamera = Camera.extend( {

        defaults: Camera._.extend( {
            fov: 45,
            aspect: 1,
            near: 0.1,
            far: 2000
        }, Camera.prototype.defaults ),

        initialize: function( cid, options ){

            PerspectiveCamera.super.initialize.call( this, cid, options );
            
            this.updateProjectionMatrix( );

        },

        init: function( options ){
            Camera.prototype.init.call( this, options );
            this.fov = options.fov;
            this.aspect = options.aspect;
            this.near = options.near;
            this.far = options.far;
        },

        updateProjectionMatrix: function( ){
            this.projectionMatrix.perspective( this.fov, this.aspect, this.near, this.far );
        }

    } );

    return PerspectiveCamera;

} );
define( 'Display',[ 'Node' ], function ( Node ) {

    var Display = Node.extend( {

        defaults: Node._.extend( {
            visible: true
        }, Node.prototype.defaults ),

        initialize: function( cid, options ){

            Display.super.initialize.call( this, cid, options );

        },

        init: function( options ){
            Node.prototype.init.call( this, options );
            this.visible = options.visible;
        }
        
    } );

    return Display;

} );
define( 'Mesh',[ 'Display' ], function ( Display ) {

    var Mesh = Display.extend( {

        defaults: Display._.extend( {
            mode: 'TRIANGLES'
        }, Display.prototype.defaults ),

        initialize: function( cid, options ){
            Mesh.super.initialize.call( this, cid, options );
        },

        init: function( options ){
            Display.prototype.init.call( this, options );
            this.mode = options.mode;
            this.geometry = options.geometry;
            this.material = options.material;
        }

    } );

    return Mesh;

} );
define( 'CSS3D',[ 'Display' ], function ( Display ) {

    var CSS3D = Display.extend( {

        defaults: Display._.extend( {}, Display.prototype.defaults ),

        initialize: function( cid, options ){
            CSS3D.super.initialize.call( this, cid, options );
        },

        init: function( options ){
            Display.prototype.init.call( this, options );
            var element = this.element = options.element || document.createElement( 'div' );
            element.style.position = 'absolute';
            element.className += ' css3d';
        }

    } );

    return CSS3D;

} );
define( 'Projector',[ 'Base', 'Mat4', 'Display', 'Mesh', 'CSS3D' ], function( Base, Mat4, Display, Mesh, CSS3D ) {

    var Projector = Base.extend( {

        initialize: function( ){

            this.projectionMatrix = new Mat4( );
            this.cameraViewMatrix = new Mat4( );

            this.objects            = [ ];
            this.transparentObjects = [ ];
            this.opaqueObjects      = [ ];
            this.css3DObjects       = [ ];
            this.lights             = [ ];

        },

        projectScene: function( scene, camera ){

            camera.parent || scene.add( camera );

            scene.updateWorldMatrix( );

            this.projectionMatrix = camera.projectionMatrix;
            this.cameraViewMatrix.invert( camera.worldMatrix );
            
            var objects             = this.objects              = [ ];
            var transparentObjects  = this.transparentObjects   = [ ];
            var opaqueObjects       = this.opaqueObjects        = [ ];
            var css3DObjects        = this.css3DObjects         = [ ];
            var lights              = this.lights               = [ ];

            ( function( node ){

                if( node instanceof Display ) {

                    if( !!node.visible ) {

                        if( node instanceof Mesh ){

                            // if( object3D.material.alpha !== 1 ) {

                                // transparentObjects.push( object3D );

                            // } else {

                                opaqueObjects.push( node );
                            
                            // }
                        }else if( node instanceof CSS3D ){
                            css3DObjects.push( node );
                        }

                    }

                }

                // if( object3D.__type__ === D3.objectTypes.LIGHT ) {

                //  lights.push( object3D );

                // }
                
                objects.push( node );

                if( !!node.children.length ) {

                    var c = node.children.length;
                    while( c-- ) {
                        arguments.callee( node.children[ c ] );
                    }

                }

            } )( scene );

            return this;

        }

    } );

    return Projector;

	// Projector.prototype.projectVector = function( vector, camera ){

	// 	__m4_1.val( camera.matrixWorld ).invert( );
	// 	__m4_2.multiply( camera.projectionMatrix, __m4_1 );
	// 	return vector.applyProjection( __m4_2 );

	// };

	// Projector.prototype.unprojectVector = function( vector, camera ){

	// 	__m4_1.invert( camera.projectionMatrix );
	// 	__m4_2.multiply( camera.matrixWorld, __m4_1 );
	// 	return vector.applyProjection( __m4_2 );

	// };

	// var __m4_1 = new Mat4( );
	// var __m4_2 = new Mat4( );

} );
define( 'Renderer',[ 'Base', 'Projector' ], function( Base, Projector ) {

    var Renderer = Base.extend( {

        initialize: function( element ){

            Renderer.super.initialize.call( this );
            element = element || document.createElement( 'canvas' );
            this.__element = element;
            this.__context = this.createContext( element );
            this.__width = element.clientWidth;
            this.__height = element.clientHeight;
            this.projector = new Projector( );
    
            this.__defineGetter__( 'element', function( ){
                return this.__element;
            } );
            this.__defineGetter__( 'context', function( ){
                return this.__context;
            } );
            this.__defineGetter__( 'width', function( ){
                return this.__width;
            } );
            this.__defineGetter__( 'height', function( ){
                return this.__height;
            } );
            this.__defineSetter__( 'width', function( w ){
                var element = this.element;
                this.__width = w;
                element.style.width = w + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( element.width = w );
            } );
            this.__defineSetter__( 'height', function( h ){
                var element = this.element;
                this.__height = h;
                element.style.height = h + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( element.height = h );
            } );

        },

        render: function( scene, camera ){
            this.clear( );
            this.projector.projectScene( scene, camera );
        },

        createContext: function( element ){ },

        clear: function( ){ }

    } );

    return Renderer;

} );
define( 'Vec4',[ 'Vec3' ], function ( Vec3 ) {

    function Vec4( x, y, z, w ){

        if( ! ( this instanceof Vec4 ) ){
            return new Vec4( x, y, z, w );
        }

        var arr = Vec3.apply( this, arguments );

        this[ 3 ] = arr[ 3 ] || 1;

        this.length = 4;

        this.__defineGetter__( 'w', function( ){
            return this[ 3 ];
        } );
        this.__defineSetter__( 'w', function( v ){
            this[ 3 ] = v;
        } );

        this.__defineGetter__( 'r', function( ){
            return this[ 0 ];
        } );
        this.__defineSetter__( 'r', function( v ){
            this[ 0 ] = v;
        } );

        this.__defineGetter__( 'g', function( ){
            return this[ 1 ];
        } );
        this.__defineSetter__( 'g', function( v ){
            this[ 1 ] = v;
        } );

        this.__defineGetter__( 'b', function( ){
            return this[ 2 ];
        } );
        this.__defineSetter__( 'b', function( v ){
            this[ 2 ] = v;
        } );

        this.__defineGetter__( 'a', function( ){
            return this[ 3 ];
        } );
        this.__defineSetter__( 'a', function( v ){
            this[ 3 ] = v;
        } );

        return this;

    }

    Vec4.prototype = new Vec3( );

    return Vec4;

} );
define( 'Attribute',[ 'Base' ], function ( Base ) {

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
define( 'Uniform',[ 'Base' ], function ( Base ) {

    var Uniform = Base.extend( {

        initialize: function( name, type ){

            Uniform.super.initialize.call( this );

            this.name = name;
            this.type = type;

        },

        create: function( shader ){

            var GL = this.GL = shader.GL;
            this.shader = shader;

            this.location = GL.getUniformLocation( shader.program, this.name );

        },

        setData: function( data ){

            Array.isArray( data ) || ( data = [ data ] );

            var GL = this.GL;
            if( this.type.indexOf( 'Matrix' ) === -1 ){
                data.unshift( this.location );
                GL[ 'uniform' + this.type ].apply( GL, data );
            }else{
                data.unshift( this.location, false );
                GL[ 'uniform' + this.type ].apply( GL, data );
            }

        }

    } );

    return Uniform;

} );
define( 'Shader',[ 'Base', 'Attribute', 'Uniform' ], function ( Base, Attribute, Uniform ) {

    var Shader = Base.extend( {

        attrs: {
            vertex: '',
            fragment: ''
        },

        initialize: function( GL, geometry, material ){

            this.GL = GL;
            this.geometry = geometry;
            this.material = material;

            Shader.super.initialize.call( this );

            this.vertexShader = null;
            this.fragmentShader = null;
            this.program = null;


            this.set( {
                vertex: [
                    'uniform mat4 projectionMatrix;',
                    'uniform mat4 modelMatrix;',
                    'uniform mat4 viewMatrix;',
                    material.source.vertex
                ].join( '\n' ),
                fragment: [
                    'precision highp float;',
                    material.source.fragment
                ].join( '\n' )
            } );

            var vertexShader = this.vertexShader = GL.createShader( GL.VERTEX_SHADER );
            GL.shaderSource( vertexShader, this.get( 'vertex' ) );
            GL.compileShader( vertexShader );

            var fragmentShader = this.fragmentShader = GL.createShader( GL.FRAGMENT_SHADER );
            GL.shaderSource( fragmentShader, this.get( 'fragment' ) );
            GL.compileShader( fragmentShader );

            var program = this.program = GL.createProgram( );
            GL.attachShader( program, vertexShader );
            GL.attachShader( program, fragmentShader );
            GL.linkProgram( program );

        },

        use: function( ){
            this.GL.useProgram( this.program );
            return this;
        },

        draw: function( ){

            var GL = this.GL;

            if( this.geometry.attributes.index ){
                GL.drawElements( GL.TRIANGLES, this.geometry.count, GL.UNSIGNED_SHORT, 0 );
            }else{
                GL.drawArrays( GL.TRIANGLES, 0, this.geometry.count );
            }

        }

    } );

    return Shader;

} );
define( 'CONST',[],function( ) {

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
define( 'WebGLRenderer',[ 'Renderer', 'Vec4', 'Shader', 'Uniform', 'CONST' ], function( Renderer, Vec4, Shader, Uniform, CONST ) {

    var WebGLRenderer = Renderer.extend( {

        EXTENSIONS: [
            'OES_texture_float',
            'OES_texture_half_float',
            'OES_texture_float_linear',
            'OES_texture_half_float_linear',
            'OES_standard_derivatives',
            'OES_vertex_array_object',
            'OES_element_index_uint',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_depth_texture',
            'EXT_texture_filter_anisotropic',
            'WEBGL_draw_buffers'
        ],

        attrs: {

            webGLContextAttrs: {
                alpha: true,
                depth: true,
                stencil: false,
                antialias: true,
                premultipliedAlpha: true,
                preserveDrawingBuffer: false
            },

            color: Vec4( )

        },

        initialize: function( canvas ){

            this.extensions = {};
            this.shader = null;

            WebGLRenderer.super.initialize.call( this, canvas );
            
            this.__GL = this.context;
            this.__defineGetter__( 'GL', function( ){
                return this.__GL;
            } );

            this.GL.viewport( 0, 0, this.width, this.height );

        },

        render: function( scene, camera ){
            
            WebGLRenderer.super.render.call( this, scene, camera );

            this.renderDisplayArray( this.projector.opaqueObjects );
            this.renderDisplayArray( this.projector.transparentObjects );

        },

        createContext: function( canvas ){

            try {

                var GL = canvas.getContext( 'webgl', this.get( 'webGLContextAttrs' ) ) || canvas.getContext( 'experimental-webgl', this.get( 'webGLContextAttrs' ) );
                // 添加扩展
                Renderer._.each( this.EXTENSIONS, function( x ){
                    
                    var ext = GL.getExtension( x );
                    if ( !ext ) {
                        ext = GL.getExtension( 'MOZ_' + x );
                    }
                    if ( !ext ) {
                        ext = GL.getExtension( 'WEBKIT_' + x );
                    }
                    this.extensions[ x ] = ext;
                    
                }, this );

                GL.clearColor.apply( GL, this.get( 'color' ) );

                this.__context = GL;
                return GL;

            } catch ( exception ) {

                console.error( 'WebGL Context Creation Failed!' );

            }

        },

        renderDisplayArray: function( displayArray ){

            var len = displayArray.length,
                renderable  = null;

            while( len-- ) {

                renderable = displayArray[ len ];
                this.renderDisplay( renderable );

            }

        },

        renderDisplay: function( display ){

            var GL = this.GL,
                projector = this.projector;

            var material    = display.material,
                geometry    = display.geometry;

            GL.enable( CONST.CULL_FACE );

            // ---------- ---------- | Shader | ---------- ---------- //
            var shader = this.buildShader( geometry, material );

            if( shader !== this.shader ) {

                this.disableAttribArrays( );
                this.shader = shader.use( );
                this.enableAttribArrays( );

            }

            // ---------- ---------- | Uniforms | ---------- ---------- //
            material.uniforms.modelMatrix.setData( new Float32Array( display.worldMatrix ) );
            material.uniforms.viewMatrix.setData( new Float32Array( projector.cameraViewMatrix ) );
            material.uniforms.projectionMatrix.setData( new Float32Array( projector.projectionMatrix ) );
            // WebGLRenderer._.each( material.uniforms, function( x ){
            //     x.setData( shader );
            // } );
            // -- 贴图 -- //
            var map = material.map;
            if( !!map && map.ready ) {

                if( !map.data ) {
                    this.processTexture( map );
                }

                GL.activeTexture( CONST.TEXTURE0 + map.index );
                GL.bindTexture( CONST.TEXTURE_2D, map.data );
                uniforms.map.makeValue( map.index, GL, shaderProgram );

            }
            // ---------- ---------- | Attributes | ---------- ---------- //
            WebGLRenderer._.each( geometry.attributes, function( x ){
                x.draw( );
            } );

            shader.draw( );

        },

        enableAttribArrays: function( ){
            if( this.shader ) {
                WebGLRenderer._.each( this.shader.geometry.attributes, function( x ){
                    x.enable( );
                } );
            }
        },

        disableAttribArrays: function( ){
            if( this.shader ) {
                WebGLRenderer._.each( this.shader.geometry.attributes, function( x ){
                    x.disable( );
                } );
            }
        },

        buildShader: function( geometry, material ){

            var GL = this.GL;

            if( !material.shader ){

                var shader = material.shader = new Shader( GL, geometry, material );
                // ---------- Uniforms ---------- //
                // 通用Uniforms
                material.add( new Uniform( 'modelMatrix', 'Matrix4fv' ) );
                material.add( new Uniform( 'viewMatrix', 'Matrix4fv' ) );
                material.add( new Uniform( 'projectionMatrix', 'Matrix4fv' ) );

                WebGLRenderer._.each( material.uniforms, function( x ){
                    x.create( shader );
                } );

                // ---------- Attributes ---------- //
                WebGLRenderer._.each( geometry.attributes, function( x ){
                    x.create( shader );
                } );

            }

            return material.shader;

        },

        clear: function( ){

            var GL = this.GL;
            GL.clear( GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT );

        }

    } );

    return WebGLRenderer;

} );
define( 'View',[ 'Scene', 'PerspectiveCamera', 'WebGLRenderer' ], function ( Scene, PerspectiveCamera, WebGLRenderer ) {

    var View = Scene.extend( {

        defaults: Scene._.extend( {
            width: window.innerWidth,
            height: window.innerHeight
        }, Scene.prototype.defaults ),

        initialize: function( cid, options ){
            this.camera = new PerspectiveCamera( );
            this.renderer = new WebGLRenderer( );
            View.super.initialize.call( this, cid, options );
            this.__defineGetter__( 'width', function( ){
                return this.__width;
            } );
            this.__defineGetter__( 'height', function( ){
                return this.__height;
            } );
            this.render( );
        },

        init: function( options ){
            Scene.prototype.init.call( this, options );
            this.setSize( options.width, options.height );
        },

        setSize: function( w, h ){
            this.__width = w;
            this.__height = h;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix( );
            this.renderer.width = w;
            this.renderer.height = h;
        },

        setCamera: function( cid ){
            var camera = cid;
            if( typeof cid === 'string' ){
                camera = this.find( cid );
            }
            this.camera = camera;
        },

        render: function( ){
            requestAnimationFrame( this.render.bind( this ) );
            this.renderer.render( this, this.camera );
        },

        setRenderer: function( renderer ){
            this.renderer = renderer;
            if( !renderer.element.parentNode ) document.body.appendChild( renderer.element );
            renderer.width = this.width;
            renderer.height = this.height;
        }

    } );

    return View;

} );
define( 'CSS3DRenderer',[ 'Renderer' ], function( Renderer ) {

    function epsilon( v ){
        return Math.abs( v ) < 0.000001 ? 0 : v;
    }

    function cameraCSSMatrix( matrix ){

        return 'matrix3d(' +
            epsilon(   matrix[ 0 ]  ) + ',' +
            epsilon( - matrix[ 1 ]  ) + ',' +
            epsilon(   matrix[ 2 ]  ) + ',' +
            epsilon(   matrix[ 3 ]  ) + ',' +
            epsilon(   matrix[ 4 ]  ) + ',' +
            epsilon( - matrix[ 5 ]  ) + ',' +
            epsilon(   matrix[ 6 ]  ) + ',' +
            epsilon(   matrix[ 7 ]  ) + ',' +
            epsilon(   matrix[ 8 ]  ) + ',' +
            epsilon( - matrix[ 9 ]  ) + ',' +
            epsilon(   matrix[ 10 ] ) + ',' +
            epsilon(   matrix[ 11 ] ) + ',' +
            epsilon(   matrix[ 12 ] ) + ',' +
            epsilon( - matrix[ 13 ] ) + ',' +
            epsilon(   matrix[ 14 ] ) + ',' +
            epsilon(   matrix[ 15 ] ) +
        ')';

    }

    function nodeMatrix( matrix ) {

        return 'translate3d(-50%,-50%,0) matrix3d(' +
            epsilon(   matrix[ 0 ]  ) + ',' +
            epsilon(   matrix[ 1 ]  ) + ',' +
            epsilon(   matrix[ 2 ]  ) + ',' +
            epsilon(   matrix[ 3 ]  ) + ',' +
            epsilon( - matrix[ 4 ]  ) + ',' +
            epsilon( - matrix[ 5 ]  ) + ',' +
            epsilon( - matrix[ 6 ]  ) + ',' +
            epsilon( - matrix[ 7 ]  ) + ',' +
            epsilon(   matrix[ 8 ]  ) + ',' +
            epsilon(   matrix[ 9 ]  ) + ',' +
            epsilon(   matrix[ 10 ] ) + ',' +
            epsilon(   matrix[ 11 ] ) + ',' +
            epsilon(   matrix[ 12 ] ) + ',' +
            epsilon(   matrix[ 13 ] ) + ',' +
            epsilon(   matrix[ 14 ] ) + ',' +
            epsilon(   matrix[ 15 ] ) +
        ')';

    };

    var CSS3DRenderer = Renderer.extend( {

        initialize: function( element ){

            CSS3DRenderer.super.initialize.call( this, element || document.createElement( 'div' ) );

            this.cameraElement = document.createElement( 'div' );

            this.cameraElement.style.WebkitTransformStyle = 'preserve-3d';
            this.cameraElement.style.MozTransformStyle = 'preserve-3d';
            this.cameraElement.style.oTransformStyle = 'preserve-3d';
            this.cameraElement.style.transformStyle = 'preserve-3d';

            element = this.element;
            element.style.overflow = 'hidden';

            element.style.WebkitTransformStyle = 'preserve-3d';
            element.style.MozTransformStyle = 'preserve-3d';
            element.style.oTransformStyle = 'preserve-3d';
            element.style.transformStyle = 'preserve-3d';

            element.appendChild( this.cameraElement );

            this.__defineSetter__( 'width', function( w ){
                var element = this.element;
                this.__width = w;
                element.style.width = w + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( element.width = w );
                this.cameraElement.style.width = w + 'px';
            } );
            this.__defineSetter__( 'height', function( h ){
                var element = this.element;
                this.__height = h;
                element.style.height = h + 'px';
                element.tagName.toLowerCase( ) === 'canvas' && ( element.height = h );
                this.cameraElement.style.height = h + 'px';
            } );

        },

        render: function( scene, camera ){

            var fov = 0.5 / Math.tan( camera.fov * 0.5 * ( Math.PI / 180 ) ) * this.height;

            var element = this.element;

            element.style.WebkitPerspective = fov + 'px';
            element.style.MozPerspective = fov + 'px';
            element.style.oPerspective = fov + 'px';
            element.style.perspective = fov + 'px';

            var projector = this.projector;

            var objects = projector.projectScene( scene, camera ).css3DObjects;

            var style = 'translate3d(0,0,' + fov + 'px)' + cameraCSSMatrix( projector.cameraViewMatrix ) + 
                ' translate3d(' + this.width * 0.5 + 'px,' + this.height * 0.5 + 'px, 0)';

            var cameraElement = this.cameraElement;

            cameraElement.style.WebkitTransform = style;
            cameraElement.style.MozTransform = style;
            cameraElement.style.oTransform = style;
            cameraElement.style.transform = style;

            for ( var i = 0, il = objects.length; i < il; i ++ ) {

                var object = objects[ i ];

                var element = object.element;
 
                style = nodeMatrix( object.worldMatrix );

                element.style.WebkitTransform = style;
                element.style.MozTransform = style;
                element.style.oTransform = style;
                element.style.transform = style;

                if ( !element.parentNode || element.parentNode !== this.cameraElement ) {

                    this.cameraElement.appendChild( element );

                }

            }

        }

    } );

    return CSS3DRenderer;

} );
( function( ){

    define( 'coo', [ 

        'View', 'Node', 'Display', 'CSS3DRenderer', 'CSS3D' 

    ], function ( View, Node, Display, CSS3DRenderer, CSS3D ) {

        return {
            View: View,
            Node: Node,
            Display: Display,
            CSS3DRenderer: CSS3DRenderer,
            CSS3D: CSS3D
        }

    } );

    require( [ 'coo' ] );
    
} )( );
define("build", function(){});


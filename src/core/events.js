define( function( ) {

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

} )
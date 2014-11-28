define('hx$',
    ['jquery','Q','underscore'],
    //modules loaded through global scope alone: Q
    function ($,Q,_) {
        //Haxy.Closures library. Data structures, common functionality, and language extensions.
        //Written by David Dworetzky.
        var module = {};

        //logging...
        module.LoggingEnabled = module.Enabled.Enabled;
        //logging mutator/accessor
        module.ConsoleLoggingEnabled = (function (arg) {
            if (arg === undefined) {
                return module.LoggingEnabled;
            }
            else {
                module.LoggingEnabled = arg;
                return arg;
            }
        });
        //log gate
        module.Log = (function (text) {
            if (module.ConsoleLoggingEnabled()) {
                console.log(text);
            }
        });
        //aliasing
        module.log = module.Log;
        //DATASTRUCTURES AND METHODS
        //http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
        module.GUID = (function GUID(options) {

            //if we request an empty guid... return nothing.
            if (options !== undefined) {
                if (options === 0) {
                    return '00000000-0000-0000-0000-000000000000';
                }
            }
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        });

        //alias to Guid as well as GUID
        module.Guid = module.GUID;

        module.GetKeyByValue = (function (obj, value) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (obj[prop] === value)
                        return prop;
                }
            }
        });

        module.TryGetValue = (function (obj, property, result) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(property)) {
                    if (prop === property) {
                        result.result = 1;
                        return obj[prop];
                    }
                }
            }
            //false
            result.result = 0;
            return undefined;
        });



        //Object that is observed by Name/ID
        module.IDObject = (function (ID, Name) {
            var self = this;
            self.Name = ko.observable(Name).withPausing();
            self.ID = ko.observable(ID).withPausing();
        });

        module.StatefulObject = (function (States, Cyclical) {
            //States, array of States
            this.States = States;
            this.Cyclical = Cyclical;

            this.CurrState = 0;

            this.ObservedState = (function () {
                return this.States[this.CurrState];
            });
            //Advance State 
            this.AdvanceState = (function () {
                var self = this;
                if (self.States.length > self.CurrState + 1) {
                    self.CurrState = self.CurrState + 1;
                }
                else if (self.States.length === self.CurrState + 1 && self.Cyclical === 1) {
                    self.CurrState = 0;
                }
            });
        });


        module.foreach = (function (array, func) {

            //first we check to see if this is legitimately an array. If not, we treat execution as if it should be done
            //one singleton.
            if (array instanceof Array) {
                //if array not undefined or empty...
                if (array) {
                    for (var i = 0; i < array.length; i++) {
                        func(array[i]);
                    }
                }
            }
            else {
                func(array);
            }
        });

        module.where = (function (array, comparison) {
            var values = [];
            for (var i = 0; i < array.length; i++) {
                if (comparison(ko.utils.unwrapObservable(array[i]))) {
                    values.push(array[i]);
                }
            }
            return values;
        });


        module.single = (function (array, comparison) {
            var values = [];
            for (var i = 0; i < ko.utils.unwrapObservable(array).length; i++) {
                if (comparison(ko.utils.unwrapObservable(array[i]))) {
                    return array[i];
                }
            }
        });
        module.removeFirst = (function (array, comparison) {
            var toRemove = -1;
            for (var i = 0; i < ko.utils.unwrapObservable(array).length; i++) {
                if (comparison(ko.utils.unwrapObservable(array[i])))
                {
                    toRemove = i;
                }
            }
            if (toRemove !== -1) { array.splice(toRemove, 1); }
            return array;
        })

        module.EnumToArray = (function (enm)
        {
            var vals = []
            for(var val in enm)
            {
                vals.push(val)
            }
            return vals;
        });

        module.singleordefault = (function (array, comparison) {
            if (array.length !== 0) {
                var result = module.single(array, comparison);
                if (result === undefined) {
                    return array[0];
                }
                else {
                    return result;
                }
            }
            else {
                return undefined
            }
        });

        //INHERITANCE AND COMPOSITION
        //after this is called, the constructor for the base method also needs to invoke the base constructor...
        module.Inherits = (function (target, source) {
            //store constructor
            var temp = source;
            //source is a _target object.
            source.prototype = target;
            //Correct constructor prototype reference... 
            source.prototype.constructor = temp;
        });

        //only use with primitive objects, and consider using _.extend instead.
        module.MixInto = (function (target, source, methodNames) {
            // ignore the actual args list and build from arguments so we can
            // be sure to get all of the method names
            var args = Array.prototype.slice.apply(arguments);
            source = args.shift();
            target = args.shift();
            methodNames = args;

            var method;
            var length = methodNames.length;
            for (var i = 0; i < length; i++) {
                method = methodNames[i];

                // bind the function from the source and assign the
                // bound function to the target
                source[method] = _.bind(target[method], source);
            }
        });

        //given two closures i.e. constructors for objects, return a new object that is an amalgam of the two
        module.DynamicMixInto = (function (target, source, methodNames) {
            var args = Array.prototype.slice.apply(arguments);
            target = args.shift();
            source = args.shift();
            methodNames = args;

            var obj1 = new target();
            var obj2 = new source();

            var length = methodNames.length;
            for (var i = 0; i < length; i++) {
                method = methodNames[i];

                // bind the function from the source and assign the
                // bound function to the target
                obj2[method] = _.bind(obj1[method], obj2);

            }
            return obj2;

        });
    });
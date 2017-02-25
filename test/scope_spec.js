/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

describe("Scope", function(){
    it("can be constructed and used as an object", function(){
        var scope = new Scope();
        scope.aProperty = 1;

        expect(scope.aProperty).toBe(1);
    });
});


describe("digest", function(){
    var scope;
    beforeEach(function(){
        scope = new Scope();
    });

    it("calls the watch function at the first $digest", function(){
        var listenerFn = jasmine.createSpy();
        var watchFn =  function() {
            return "what ?!";
        }
        scope.$watch(watchFn, listenerFn);

        scope.$digest();

        expect(listenerFn).toHaveBeenCalled();
    });

    it("should have been called with scope as parameter", function(){
        // page 9
        var watchFn = jasmine.createSpy();
        var  listenerFn =  function() { return "ww"};

        scope.$watch(watchFn, listenerFn);

        scope.$digest();

        expect(watchFn).toHaveBeenCalledWith(scope);
    });

    it("should call the listenerFn only when propery is dirty", function () {
        scope.counter = 0;
        scope.someProperty = 'a';
        function retPropertyWatcher() {
            return scope.someProperty;
        }

        function countlistenFn(newValue, oldValue) {
            scope.counter ++;
        }

        scope.$watch(retPropertyWatcher, countlistenFn);
        expect(scope.counter).toBe(0);
        scope.$digest();
        expect(scope.counter).toBe(1);
        scope.$digest();
        expect(scope.counter).toBe(1);
        scope.someProperty = 'b';
        expect(scope.counter).toBe(1);
        scope.$digest();
        expect(scope.counter).toBe(2);
    });


    it("should call the listenerFn if the first returned value was undefined", function() {
        /** never initialze a value with undefined cuz sometimes
        the old value was defined a number for example and the new value
        is undefined so the listenerFn will not be called in this case*/

        scope.counter = 0;
        var watchFn = function(){
            return scope.someProperty;
        };

        var listenerFn = function() {
            scope.counter ++;
        };
        scope.$watch(watchFn, listenerFn);
        expect(scope.counter).toBe(0);
        scope.$digest();
        expect(scope.counter).toBe(1);

    });

    it("should pass the newValue as oldValue for the first time digest is called", function () {
        var gOldValue;
        scope.someProperty = "hello";
        var watchFn = function() {
            return scope.someProperty;
        };

        var listenerFn = function(newValue, oldValue, scope) {
            gOldValue = oldValue;
        };
        scope.$watch(watchFn, listenerFn);
        scope.$digest();
        expect(gOldValue).toBe("hello");
    });


    it("may have watch function without listener just to norify", function(){
        var watchFn = jasmine.createSpy().and.returnValue('anything');
        scope.$watch(watchFn);
        scope.$digest();
        expect(watchFn).toHaveBeenCalled();
    });


    it("should give up digesting after 10 iterations", function(){
        scope.counterWatchA = 0;
        scope.counterWatchB = 0;

        scope.$watch(function(){
            return scope.counterWatchA;
        },function(){
            scope.counterWatchB++;
        });

        scope.$watch(function(){
            return scope.counterWatchB;
        },function(){
            scope.counterWatchA++;
        });

        expect((function() { scope.$digest(); })).toThrow();
    });

    it("compare based on value not by refernce if enabled", function(){
        scope.someProperty = [1,2,3];
        scope.listenercounter = 0;

        scope.$watch(function(){
            return scope.someProperty;
        }, function(){
            scope.listenercounter++;
        }, true);

        scope.$digest();
        expect(scope.listenercounter).toBe(1);
        scope.someProperty.push(4);
        scope.$digest();
        expect(scope.listenercounter).toBe(2);
    });

    it("should handle watching NaN =", function(){
        scope.nanProperty = 0/0;
        scope.listenercounter = 0;

        scope.$watch(function(){
            return scope.nanProperty;
        }, function(){
            scope.listenercounter++;
        }, false);
        scope.$digest();
        expect(scope.listenercounter).toBe(1);

        scope.$digest();
        expect(scope.listenercounter).toBe(1);
    });

    it("$eval should avaluete function & it's arguments", function(){
        scope.someProperty = 40;
        var result, resultWithArgs;

        result = scope.$eval(function(scope){
            return scope.someProperty;
        });

        resultWithArgs = scope.$eval(function(scope, local){
            return scope.someProperty + local;
        },2);


        expect(result).toBe(40);
        expect(resultWithArgs).toBe(42);
    });

    it("$apply execute the eval function and starts a digest", function(){
        scope.aValue = "hello value";
        scope.digestCounter = 0;

        scope.$watch(function(){
            return scope.aValue;
        }, function(newValue, oldValue, scope){
            scope.digestCounter ++;
        });
        scope.$digest();
        expect(scope.digestCounter).toBe(1);

        var result  = scope.$apply(function(scope, local){
            scope.aValue = "howla";
            return scope.aValue;
        });

        expect(scope.digestCounter).toBe(2);
        expect(result).toBe("howla");
    });


    it("should evaluate async in the current digest cycle", function(){
        scope.someValue = [1, 2, 3];
        scope.evaluatedAsync = false;
        scope.evaluatedAsyncImmediatly = false;

        scope.$watch(function(){
            return scope.someValue;
        },function(newValue, oldValue, scope){
            scope.$evalAsync(function(scope){
                scope.evaluatedAsync = true;
            });
            scope.evaluatedAsyncImmediatly = scope.evaluatedAsync;
        });
        scope.$digest();
        expect(scope.evaluatedAsync).toBe(true);
        expect(scope.evaluatedAsyncImmediatly).toBe(false);
    });


    it("has a $$phase field whose value is the current digest phase", function() {
        scope.aValue = [1, 2, 3];
        scope.phaseInWatchFunction = undefined;
        scope.phaseInListenerFunction = undefined;
        scope.phaseInApplyFunction = undefined;

        scope.$watch(
            function(scope) {
                scope.phaseInWatchFunction = scope.$$phase;
                return scope.aValue;
            },
            function(newValue, oldValue, scope) {
                scope.phaseInListenerFunction = scope.$$phase;
            }
        );

        scope.$apply(function(scope) {
            scope.phaseInApplyFunction = scope.$$phase;
        });

        expect(scope.phaseInWatchFunction).toBe('$digest');
        expect(scope.phaseInListenerFunction).toBe('$digest');
        expect(scope.phaseInApplyFunction).toBe('$apply');
    });
});

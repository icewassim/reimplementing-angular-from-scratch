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

});

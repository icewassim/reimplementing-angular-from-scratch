/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

function Scope(){
    this.$$watchers = [];
    this.$$asyncQueque = [];
    this.$$lastDirtyWatch = null;
    this.$$phase = null;
}

function uniqueInitValue() {}/** to avoid the undefined initialisation we use functions cuz they are refernce values not euql only to themselves **/

Scope.prototype.$watch = function(watchFn, listenerFn, valueEq){
    var watcher = {
        watchFn: watchFn,
        last: uniqueInitValue,
        valueEq: !!valueEq,
        listenerFn: listenerFn || function(){}
    };
    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
};

Scope.prototype.$$areEqual = function(newValue, oldValue, valueEq){
    if(valueEq) {
        return _.isEqual(newValue, oldValue);
    }else {
        return newValue === oldValue || (typeof newValue === 'number' &&
                                         typeof oldValue === 'number' &&
                                         isNaN(newValue) &&
                                         isNaN(oldValue));
    }
};

Scope.prototype.$$digestOnce = function(){
    var newValue,
        oldValue,
        valueEq,
        dirty;

    for (var key in this.$$watchers) {
        newValue = this.$$watchers[key].watchFn(this);
        oldValue = this.$$watchers[key].last;
        valueEq = this.$$watchers[key].valueEq;
        if(! this.$$areEqual(newValue, oldValue, valueEq)) {
            this.$$lastDirtyWatch = this.$$watchers[key];
            this.$$watchers[key].last = (valueEq ?_.cloneDeep(newValue): newValue);
            this.$$watchers[key].listenerFn(newValue,
                                            (oldValue === uniqueInitValue?newValue:oldValue),
                                            this);
            dirty = true;
        }else if(this.$$lastDirtyWatch === this.$$watchers[key]) {
            return false;
        }
    }
    return dirty;
};

Scope.prototype.$digest = function () {
    var dirty,
        dirtycount = 10;

    this.$$lastDirtyWatch = null;
    this.$beginPhase("$digest");
    do{
        while(this.$$asyncQueque.length) {
            var asyncTask = this.$$asyncQueque.shift();
            asyncTask.scope.$eval(asyncTask.expression);
        }
        dirty = this.$$digestOnce();
        if((dirty || this.$$asyncQueque.length) && !(dirtycount--)) {
            this.$clearPhase();
            throw "passed 10 digests";
        }
    }while(dirty || this.$$asyncQueque.length);
    this.$clearPhase();
};

Scope.prototype.$eval = function(expression, local) {
    return expression(this, local);
};

Scope.prototype.$apply = function(expression, local) {
    /** The $digest call is done in a finally block to make sure
    the digest will happen even if
    the supplied function throws an exception.
    */
    try{
        this.$beginPhase("$apply");
        return this.$eval(expression, local);
    }finally{
        this.$clearPhase();
        this.$digest();
    }
};

Scope.prototype.$evalAsync = function(expression, local) {
    this.$$asyncQueque.push({
                                scope:this,
                                expression: expression
                            });
};


Scope.prototype.$beginPhase =  function(newPhase){
    if(this.$$phase) {
        throw this.$$pahse + "already in progress";
    }else {
        this.$$phase = newPhase;
    }
};

Scope.prototype.$clearPhase = function() {
    this.$$phase = null;
};

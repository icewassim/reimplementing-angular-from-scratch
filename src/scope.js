/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

function Scope(){
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
}

function uniqueInitValue() {}/** to avoid the undefined initialisation we use functions cuz they are refernce values not euql only to themselves **/

Scope.prototype.$watch = function(watchFn, listenerFn){
    var watcher = {
        watchFn: watchFn,
        last: uniqueInitValue,
        listenerFn: listenerFn || function(){}
    };
    this.$$watchers.push(watcher);
    this.$$lastDirtyWatch = null;
};

Scope.prototype.$$digestOnce = function(){
    var newValue,
        oldValue,
        dirty;

    for (var key in this.$$watchers) {
        newValue = this.$$watchers[key].watchFn(this);
        oldValue = this.$$watchers[key].last;
        if(newValue !== oldValue) {
            this.$$lastDirtyWatch = this.$$watchers[key];
            this.$$watchers[key].last = newValue;
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
    do{
        dirty = this.$$digestOnce();
        if(dirty && !(dirtycount--)) {
            throw "passed 10 digests";
        }
    }while(dirty);
};

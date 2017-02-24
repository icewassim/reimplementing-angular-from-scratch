/* jshint globalstrict: true */
/* global Scope: false */
'use strict';

function Scope(){
    this.$$watchers = [];
}


Scope.prototype.$watch = function(watchFn, listenerFn){
    var watcher = {
        watchFn: watchFn,
        listenerFn: listenerFn
    };

    this.$$watchers.push(watcher);
};


Scope.prototype.$digest = function(){
    for (var watchObj in this.$$watchers) {
        this.$$watchers[watchObj].listenerFn();
    }
};

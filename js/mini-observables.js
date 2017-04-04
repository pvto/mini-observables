"use strict";

function setMiniVal(store, name, value) {
    var obj = store[name];
    if (!obj) {
        obj = { };
        store[name] = obj;
    }
    if (!obj.observers) {
        obj.observers = [];
    }
    var oldVal = obj.value;
    var newVal = value;
    obj.value = newVal;
    obj.observers.forEach( function(d){ d(newVal, name, oldVal);} );
    return oldVal;
}

function getMiniVal(store, name) {
    var obj = store[name];
    if (obj)
        return obj.value;
    return null;
}

function addObserver(store, name, callback) {
    var obj = store[name];
    obj.observers.push(callback);
}

function getObservers(store, name) {
    var obj = store[name];
    if (!obj) {
        return null;
    }
    return obj.observers;
}



var BSMAP = {
  "c":"onchange", "u":"onkeyup"
};

function bootstrapDomNode(storeName, node) {
    var name = node.getAttribute("mv");
    var parts = name.split("|");
    if (parts.length === 1) {
        parts.push("c");
    }

    var store = window[storeName];
    setMiniVal(store, parts[0], getMiniVal(store, parts[0]));

    parts[1].split("").forEach(function(chr) {
        node.setAttribute(BSMAP[chr],
            "setMiniVal("+storeName+",'"+parts[0]+"',this.value);"); })

}

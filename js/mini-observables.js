"use strict";

function setMiniVal(store, name, value, dirty) {
    var obj = store[name];
    if (!obj) {
        obj = {};
        store[name] = obj;
    }
    if (!obj.observers) {
        obj.observers = [];
    }
    var oldVal = obj.value;
    var newVal = value;
    obj.value = newVal;
    if (!dirty && newVal != oldVal) {
        obj.observers.forEach( function(d){ d(newVal, name, oldVal);} );
    }
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
    if (!obj) {
        setMiniVal(store, name, null);
        obj = store[name];
    }
    obj.observers.push(callback);
}

function getObservers(store, name) {
    var obj = store[name];
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
    setMiniVal(store, parts[0], getMiniVal(store, parts[0])||null, true); // set dirty flag to prevent recursion

    parts[1].split("").forEach(function(chr) {
        var oldAttribute = node.getAttribute(BSMAP[chr]) || "";
        var newCallback = "setMiniVal(" + storeName + ", '" + parts[0] + "', this.value);";
        if (oldAttribute.indexOf(newCallback) < 0) {
            node.setAttribute(BSMAP[chr], oldAttribute + newCallback);
        }
    });

}

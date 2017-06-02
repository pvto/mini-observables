"use strict";

/* mini-observables library for observer/observable pattern
 *
 * Use with a flat store (=plain js object).
 *
 * Supports
 *
 *  set/get/clear of named model values:
 *  - setMiniVal(store, name, value)
 *  - getMiniVal(store, name)
 *  - setMiniVal(store, name, null)
 *
 * dirty set operation for such rare cases that need to prevent infinite recursion:
 *  - setMiniVal(store, name, value, dirty)
 *  - setMiniVal(store, name, null, dirty)
 *
 * adding multiple observers for named model values:
 *  - addObserver(store, name, callbck)
 *  - callback signature is xxx(newVal, name, oldVal)
 *  - observers are notified synchronously iff a model value changes, change operation does not have the dirty flag on
 *
 * additionally it is possible to set preconditions to model value updates
 *  - addMiniPreCondition(store, name, booleanCallback)
 *  - booleanCallback signature is xxx(newVal, name, oldVal)
 *  - when setting model value, all preconditions are evaluated and if any of them returns false(y), update is aborted
 *
 * there is also a little helper function for bootstrapping a dom node so that js events create setMiniVal calls:
 *  - bootstrapDomNode(storeName, node)
 *  - storeName points to a global flat store (window[storeName] must exist)
 *  - multiple handlers can be loaded on a dom node by calling this repeatedly, but identical handlers will be filtered out by the function
 *  - target node should have custom attribute "mv" in place, with structured content:
 *  - "mv" content should be a tuple separated by a | character: "myKey|c"
 *  - this yields an event handler that calls setMiniVal(store, "myKey") every time node value changes
 *  - event types are listed in the code:
 *  - "c":"onchange", "u":"onkeyup", "C":"onclick"...
 */


function setMiniVal(store, name, value, dirty) {
    var obj = store[name];
    if (!obj) {
        obj = {};
        store[name] = obj;
    }
    if (!obj.observers) {
        obj.observers = [];
    }
    if (!obj.preConditions) {
        obj.preConditions = [];
    }

    var oldVal = obj.value;
    var newVal = value;

    // check if there is a precondition blocking this update and bail out if needed
    var okToUpdate = true;
    obj.preConditions.forEach(function(pre) { okToUpdate &= pre(newVal, name, oldVal); });
    if (!okToUpdate) {
        return;
    }

    obj.value = newVal;
    if (!dirty && newVal != oldVal) {
//        console.log("set " + name + "=" + newVal + "; old=" + oldVal + " " + obj.observers.length);
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
    addByIdentityAndUniqueId__(obj.observers, callback);
}

function getObservers(store, name) {
    var obj = store[name];
    return obj.observers;
}

function addMiniPreCondition(store, name, booleanCallback) {
    var obj = store[name];
    if (!obj) {
        setMiniVal(store, name, null);
        obj = store[name];
    }
    addByIdentityAndUniqueId__(obj.preConditions, booleanCallback);
}


var BSMAP = {
  "c":"onchange", "u":"onkeyup", "C":"onclick"
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


// helpers....

function addByIdentityAndUniqueId__(list, obj) {
    var doUpdate = true;
    list.forEach(function(xx) {
        if (xx === obj) {
            doUpdate = false;
        }
    });
    if (doUpdate) {
        var pred = function(x) { return obj.uniqueId && x.uniqueId === obj.uniqueId; }
        _.remove(list, pred);
        list.push(obj);
    }
}

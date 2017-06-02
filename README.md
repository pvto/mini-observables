# Mini-observables library for observer/observable pattern

Use with a flat store (=plain js object).

## Supports

**Set/get/clear of named model values:**
```javascript
setMiniVal(store, name, value)
getMiniVal(store, name)
setMiniVal(store, name, null)
```

**Dirty set operation for such rare cases that need to prevent infinite recursion:**
```javascript
setMiniVal(store, name, value, dirty)
setMiniVal(store, name, null, dirty)
```

**Adding multiple observers for named model values:**
- ```addObserver(store, name, callbck)```
- callback signature is ```xxx(newVal, name, oldVal)```
- observers are notified synchronously iff a model value changes, change operation does not have the dirty flag on

**Additionally it is possible to set preconditions to model value updates:**
- ```addMiniPreCondition(store, name, booleanCallback)```
- booleanCallback signature is ```xxx(newVal, name, oldVal)```
- when setting model value, all preconditions are evaluated and if any of them returns false(y), update is aborted

**There is also a little helper function for bootstrapping a dom node so that js events create setMiniVal calls:**
- ```bootstrapDomNode(storeName, node)```
- storeName points to a global flat store (window[storeName] must exist)
- multiple handlers can be loaded on a dom node by calling this repeatedly, but identical handlers will be filtered out by the function
- target node should have custom attribute "mv" in place, with structured content:
- "mv" content should be a tuple separated by a | character: ```"myKey|c"```
- this yields an event handler that calls ```setMiniVal(store, "myKey")``` every time node value changes
- event types are listed in the code:
- ```"c":"onchange", "u":"onkeyup", "C":"onclick"```...

function register() {
  if (arguments.length === 1) {
    var fn = arguments[0];
    var name = fn.name;
  }
  else if (arguments.length === 2) {
    var fn = arguments[1];
    var name = arguments[0];
  }
  exports[name] = {
    args: fn.length,
    body: fn
  };
}

var crossRuntime = require("./primitives");
for (var fn in crossRuntime) {
  exports[fn] = crossRuntime[fn];
}

register(function print(val) {
  system.stdout.print(val);
  return val;
});

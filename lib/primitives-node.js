// require("fibers");

function register() {
  if (typeof arguments[0] === "function") {
    var fn = arguments[0];
    var name = fn.name;
    var async = arguments[1];
  }
  else if (typeof arguments[1] === "function") {
    var fn = arguments[1];
    var name = arguments[0];
    var async = arguments[2];
  }
  exports[name] = {
    args: fn.length,
    body: fn,
    async: async
  };
}

// function readln() {
//   var fiber = Fiber.current;
//   process.stdin.resume();
//   process.stdin.on("data", function(chunk) {
//     fiber.run(chunk);
//     // yield(chunk);
//   });
// }

var crossRuntime = require("./primitives");
for (var fn in crossRuntime) {
  exports[fn] = crossRuntime[fn];
}

register(function print(val) {
  require("sys").puts(val);
  return val;
});
register(function write(val) {
  require("sys").print(val);
  return val;
});
// process.stdin.open();
// process.stdin.pause();
register(function read() {
  process.stdin.resume();
  process.stdin.on("data", function(chunk) {
    console.log(data);
    this.responded = true;
    this.response = chunk.replace(/\n$/, "");
    process.stdin.pause();
  });
}, true);
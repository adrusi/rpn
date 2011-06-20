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
register(function write(val) {
  system.stdout.write(val).flush();
})
register(function read() {
  return system.stdin.readLine().replace(/\n$/, "");
});
register("cond-data", function(array) {
  for (var i = 0; i < array.length; i += 3) {
    if (array[i]) {
      if (typeof array[i + 2] === "string") return $fns[escapeId(array[i + 2])].body.apply(null, array[i + 1]);
    }
  }
});
register("if-data", function(pred, rdata, resp, edata, els) {
  if (pred) {
    return $fns[escapeId(resp)].body.apply(null, rdata);
  }
  else {
    return $fns[escapeId(els)].body.apply(null, edata);
  }
});
register("unless-data", function(pred, data, resp) {
  if (!pred) {
    return $fns[escapeId(resp)].body.apply(null, data);
  }
});
register("when-data", function(pred, data, resp) {
  if (pred) {
    return Efns[escapeId(resp)].body.apply(null, data);
  }
});
register(function unless(pred, resp) {
  if (!pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return $fns[escapeId(resp)].body();
  }
});
register(function when(pred, resp) {
  if (pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return $fns[escapeId(resp)].body();
  }
});
register("if", function(pred, resp, els) {
  if (pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return $fns[escapeId(resp)].body();
  }
  else {
    if (typeof els === "function") return els();
    else if (typeof els === "string") return $fns[escapeId(els)].body();
  }
});
register(function cond(array) {
  for (var i = 0; i < array.length; i += 2) {
    if (array[i]) {
      if (typeof array[i + 1] === "string") return $fns[escapeId(array[i + 1])].body();
      else if (typeof array[i + 1] === "function") return array[i + 1]();
    }
  }
});
register(function loop(itter, fn) {
  for (var i = 1; i <= itter; i++) {
    if (typeof fn === "string") $fns[escapeId(fn)].body(i);
    else if (typeof fn === "function") fn();
  }
});
register("loop-data", function(itter, data, fn) {
  for (var i = 1; i <= itter; i++) {
    $fns[escapeId(fn)].body.apply(null, [i].concat(data));
  }
});
register(function apply(args, fn) {
  return $fns[escapeId(fn)].body.apply(null, args);
});
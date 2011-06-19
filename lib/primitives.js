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

register("+", function(a, b) {
  return a + b;
});
register("-", function(a, b) {
  return a - b;
});
register("*", function(a, b) {
  return a * b;
});
register("/", function(a, b) {
  return a / b;
});
register("÷", function(a, b) {
  return a / b;
});
register("%", function(a, b) {
  return a % b;
});
register("^", function(a, b) {
  return Math.pow(a, b);
});
register("=", function(a, b) {
  return a === b;
});
register("!=", function(a, b) {
  return a !== b;
});
register("≠", function(a, b) {
  return a !== b;
});
register(">", function(a, b) {
  return a > b;
});
register("<", function(a, b) {
  return a < b;
});
register("<=", function(a, b) {
  return a <= b;
});
register(">=", function(a, b) {
  return a >= b;
});
register("≤", function(a, b) {
  return a <= b;
});
register("≥", function(a, b) {
  return a >= b;
});
register(function when(pred, resp) {
  if (pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return fns[resp].body();
  }
});
register("when-data", function(pred, data, resp) {
  if (pred) {
    return fns[resp].body.apply(null, data);
  }
});
register(function unless(pred, resp) {
  if (!pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return fns[resp].body();
  }
});
register("unless-data", function(pred, data, resp) {
  if (!pred) {
    return fns[resp].body.apply(null, data);
  }
});
register("if", function(pred, resp, els) {
  if (pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return fns[resp].body();
  }
  else {
    if (typeof els === "function") return els();
    else if (typeof els === "string") return fns[els].body();
  }
});
register("if-data", function(pred, rdata, resp, edata, els) {
  if (pred) {
    return fns[resp].body.apply(null, rdata);
  }
  else {
    return fns[els].body.apply(null, edata);
  }
});
register("un`", function(deferred) {
  return (typeof deferred === "function") ? deferred() : deferred;
});
register(",", function(list, val) {
  if (list instanceof Array) {
    return list.concat([val]);
  }
  else {
    return [list, val];
  }
});
register(function car(list) {
  return list[0];
});
register(function cdr(list) {
  return list.slice(1);
});
register(function get(obj, val) {
  return obj[val];
});
register(function loop(itter, fn) {
  for (var i = 1; i <= itter; i++) {
    if (typeof fn === "string") fns[fn].body(i);
    else if (typeof fn === "function") fn();
  }
});
register("loop-data", function(itter, data, fn) {
  for (var i = 1; i <= itter; i++) {
    fns[fn].body.apply(null, [i].concat(data));
  }
});
register(function apply(args, fn) {
  return fns[fn].body.apply(null, args);
});
register(function array() {
  return [];
});
register(function print(val) {
  console.log(val);
  return val;
});
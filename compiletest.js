var $gvars = {};
var $fns = {};
function escapeId(id) {
  return "$" + id
    .replace(/\$/g, "$$SIGIL$$")
    .replace(/-/g, "$$HYPHEN$$")
    .replace(/\+/g, "$$PLUS$$")
    .replace(/,/g, "$$COMMA$$")
    .replace(/\./g, "$$DOT$$")
    .replace(/\//g, "$$SLASH$$")
    .replace(/\*/g, "$$STAR$$")
    .replace(/%/g, "$$PERCENT$$")
    .replace(/\?/g, "$$QUERY$$")
    .replace(/!/g, "$$BANG$$")
    .replace(/\^/g, "$$CARAT$$")
    .replace(/&/g, "$$AND$$")
    .replace(/=/g, "$$EQUAL$$")
    .replace(/</g, "$$LT$$")
    .replace(/>/g, "$$GT$$")
    .replace(/\|/g, "$$PIPE$$")
    .replace(/#/g, "$$HASH$$")
    .replace(/@/g, "$$AT$$")
    .replace(/~/g, "$$TILDE$$")
    .replace(/`/g, "$$BACKTICK$$")
    .replace(/≤/g, "$$LTE$$")
    .replace(/≥/g, "$$GTE$$")
    .replace(/÷/g, "$$DIV$$")
    .replace(/≠/g, "$$NEQ$$")
    ;
}
$fns.$$PLUS$ = { args:2, body: function (a, b) {
  return a + b;
}};
$fns.$$HYPHEN$ = { args:2, body: function (a, b) {
  return a - b;
}};
$fns.$$STAR$ = { args:2, body: function (a, b) {
  return a * b;
}};
$fns.$$SLASH$ = { args:2, body: function (a, b) {
  return a / b;
}};
$fns.$$DIV$ = { args:2, body: function (a, b) {
  return a / b;
}};
$fns.$$PERCENT$ = { args:2, body: function (a, b) {
  return a % b;
}};
$fns.$$CARAT$ = { args:2, body: function (a, b) {
  return Math.pow(a, b);
}};
$fns.$$EQUAL$ = { args:2, body: function (a, b) {
  return a === b;
}};
$fns.$$BANG$$EQUAL$ = { args:2, body: function (a, b) {
  return a !== b;
}};
$fns.$$NEQ$ = { args:2, body: function (a, b) {
  return a !== b;
}};
$fns.$$GT$ = { args:2, body: function (a, b) {
  return a > b;
}};
$fns.$$LT$ = { args:2, body: function (a, b) {
  return a < b;
}};
$fns.$$LT$$EQUAL$ = { args:2, body: function (a, b) {
  return a <= b;
}};
$fns.$$GT$$EQUAL$ = { args:2, body: function (a, b) {
  return a >= b;
}};
$fns.$$LTE$ = { args:2, body: function (a, b) {
  return a <= b;
}};
$fns.$$GTE$ = { args:2, body: function (a, b) {
  return a >= b;
}};
$fns.$when = { args:2, body: function when(pred, resp) {
  if (pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return $fns[escapeId(resp)].body();
  }
}};
$fns.$when$HYPHEN$data = { args:3, body: function (pred, data, resp) {
  if (pred) {
    return Efns[escapeId(resp)].body.apply(null, data);
  }
}};
$fns.$unless = { args:2, body: function unless(pred, resp) {
  if (!pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return $fns[escapeId(resp)].body();
  }
}};
$fns.$unless$HYPHEN$data = { args:3, body: function (pred, data, resp) {
  if (!pred) {
    return $fns[escapeId(resp)].body.apply(null, data);
  }
}};
$fns.$if = { args:3, body: function (pred, resp, els) {
  if (pred) {
    if (typeof resp === "function") return resp();
    else if (typeof resp === "string") return $fns[escapeId(resp)].body();
  }
  else {
    if (typeof els === "function") return els();
    else if (typeof els === "string") return $fns[escapeId(els)].body();
  }
}};
$fns.$if$HYPHEN$data = { args:5, body: function (pred, rdata, resp, edata, els) {
  if (pred) {
    return $fns[escapeId(resp)].body.apply(null, rdata);
  }
  else {
    return $fns[escapeId(els)].body.apply(null, edata);
  }
}};
$fns.$cond = { args:1, body: function cond(array) {
  for (var i = 0; i < array.length; i += 2) {
    if (array[i]) {
      if (typeof array[i + 1] === "string") return $fns[escapeId(array[i + 1])].body();
      else if (typeof array[i + 1] === "function") return array[i + 1]();
    }
  }
}};
$fns.$cond$HYPHEN$data = { args:1, body: function (array) {
  for (var i = 0; i < array.length; i += 3) {
    if (array[i]) {
      if (typeof array[i + 2] === "string") return $fns[escapeId(array[i + 2])].body.apply(null, array[i + 1]);
    }
  }
}};
$fns.$else = { args:0, body: function () {
  return true;
}};
$fns.$un$BACKTICK$ = { args:1, body: function (deferred) {
  return (typeof deferred === "function") ? deferred() : deferred;
}};
$fns.$$COMMA$ = { args:2, body: function (list, val) {
  if (list instanceof Array) {
    return list.concat([val]);
  }
  else {
    return [list, val];
  }
}};
$fns.$car = { args:1, body: function car(list) {
  return list[0];
}};
$fns.$cdr = { args:1, body: function cdr(list) {
  return list.slice(1);
}};
$fns.$get = { args:2, body: function get(obj, val) {
  return obj[val];
}};
$fns.$loop = { args:2, body: function loop(itter, fn) {
  for (var i = 1; i <= itter; i++) {
    if (typeof fn === "string") $fns[escapeId(fn)].body(i);
    else if (typeof fn === "function") fn();
  }
}};
$fns.$loop$HYPHEN$data = { args:3, body: function (itter, data, fn) {
  for (var i = 1; i <= itter; i++) {
    $fns[escapeId(fn)].body.apply(null, [i].concat(data));
  }
}};
$fns.$apply = { args:2, body: function apply(args, fn) {
  return $fns[escapeId(fn)].body.apply(null, args);
}};
$fns.$array = { args:0, body: function array() {
  return [];
}};
$fns.$print = { args:1, body: function print(val) {
  system.stdout.print(val);
  return val;
}};
$fns.$write = { args:1, body: function write(val) {
  system.stdout.write(val).flush();
}};
$fns.$read = { args:0, body: function read() {
  return system.stdin.readLine().replace(/\n$/, "");
}};
$fns.$main = { args: 0, body: function() {
var $vars = Object.create($gvars);
;
$fns.$main$SLASH$interpret.body($fns.$prompt.body("\u001b[35mOK? y/n > \u001b[0m"));
}};
$fns.$main$SLASH$interpret = { args: 1, body: function() {
var $vars = Object.create($gvars);
$vars.$resp = arguments[0];
(function() { return $vars.$resp = $fns.$un$BACKTICK$.body($vars.$resp); }());
$fns.$cond.body($fns.$$COMMA$.body($fns.$$COMMA$.body($fns.$$COMMA$.body($fns.$$COMMA$.body($fns.$$COMMA$.body($fns.$$COMMA$.body($fns.$array.body(), $fns.$$EQUAL$.body($vars.$resp, "y")), (function() { var $args = ["\u001b[36mGreat!\u001b[0m"]; return function() { return $fns.$print.body.apply(null, $args); }; }())), $fns.$$EQUAL$.body($vars.$resp, "n")), (function() { var $args = ["\u001b[31mThat's too bad\u001b[0m"]; return function() { return $fns.$print.body.apply(null, $args); }; }())), $fns.$else.body()), (function() { var $args = [(function() { var $args = ["\u001b[41;30mERROR\u001b[0m\n\u001b[35mOK? y/n > \u001b[0m"]; return function() { return $fns.$prompt.body.apply(null, $args); }; }())]; return function() { return $fns.$main$SLASH$interpret.body.apply(null, $args); }; }())));
}};
$fns.$prompt = { args: 1, body: function() {
var $vars = Object.create($gvars);
$vars.$prompt = arguments[0];
$fns.$write.body($vars.$prompt);
$fns.$read.body();
}};
$fns.$main.body();

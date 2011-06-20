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

global.escapeId = escapeId;

exports.init = function(input, engine) {
  global.gvars = {};
  function exec(input, fns, vars) {
    (function findStrs() {
      var inStr = false;
      var escaped = false;
      var chars = input.split("");
      chars.forEach(function(char, index) {
        if (inStr && char.match(/\s|\(|\)|\[|\]/)) {
          chars[index] = "\033" + char;
        }
        if (!escaped && char === "\"") {
          inStr = !inStr;
        }
      });
      input = chars.join("");
    }());
  
    (function removeComments() {
      input = input.replace(/(^|.)\[[\s\S]+?\]/g, function(match, pre) {
        if (pre !== "\033") return pre;
        else return match;
      }).replace(/(^|.)(\s|\(|\))\s+/g, function(match, pre, space) {
        if (pre !== "\033") return pre + " ";
      });
    }());
  
    input = input.replace(/^\s+|\s+$/g, "");

    (function split() {
      var tokens = [];
      var token = "";
      var escaped = false;
      var chars = input.split("");
      chars.forEach(function(char) {
        if (char === "\033") {
          escaped = true;
          return;
        }
        else if (char.match(/\s|\(|\)/) && !escaped) {
          token && tokens.push(token);
          token = "";
        }
        else {
          token += char;
        }
        escaped = false;
      });
      input = tokens.concat([token]);
    }());

    (function convertVals() {
      input.forEach(function(token, index) {
        if (token.substring(0, 1) === "\"" && token.substr(-1) === "\"") {
          token = token.split("");
          token.forEach(function(char, index) {
            if (char === "\033") token.splice(index, 1);
          });
          input[index] = eval(token.join(""));
        }
        else if (token.match(/^[0-9]+(\.[0-9]+)?$/)) {
          input[index] = +token;
        }
        else if (token.substring(0, 1) === "$") {
          input[index] = { type: "var", name: token.substring(1) };
        }
        else {
          input[index] = { type: "fn", name: token };
        }
      });
    }());
  
    // return (function run() {
    //   var stack = [];
    //   input.forEach(function(token, index) {
    //     if (token.type && token.type === "fn" && token.name === "set") {
    //       var id = stack[stack.length - 2];
    //       var val = stack[stack.length - 1];
    //       if (val.type && val.type === "var") {
    //         val = vars[val.name];
    //       }
    //       vars[id.name] = val;
    //     }
    //     else if (token.type && token.type === "fn" && token.name === "gset") {
    //       var id = stack[stack.length - 2];
    //       var val = stack[stack.length - 1];
    //       if (val.type && val.type === "var") {
    //         val = vars[val.name];
    //       }
    //     
    //        vars[id.name] = gvars[id.name] = val;
    //     }
    //     else if (token.type && token.type === "fn" && token.name === "`set") {
    //       var id = stack[stack.length - 2];
    //       var val = stack[stack.length - 1];
    //       if (val.type && val.type === "var") {
    //         val = vars[val.name];
    //       }
    //       stack.pop();
    //       stack.pop();
    //       stack.push(function() {
    //         vars[id.name] = val;
    //       });
    //     }
    //     else if (token.type && token.type === "fn" && token.name === "`gset") {
    //       var id = stack[stack.length - 2];
    //       var val = stack[stack.length - 1];
    //       if (val.type && val.type === "var") {
    //         val = vars[val.name];
    //       }
    //       stack.pop();
    //       stack.pop();
    //       stack.push(function() {
    //         vars[id.name] = gvars[id.name] = val;
    //       });
    //     }
    //     else if (token.type && token.type === "fn") {
    //       if (token.name.substring(0, 1) !== "`") {
    //         var args = [];
    //         for (var i = 1; i < fns[token.name].args + 1; i++) {
    //           args.unshift(stack[stack.length - i]);
    //         }
    //         for (var j = 0; j < args.length; stack.pop(), j++);
    //         args.forEach(function(arg, index) {
    //           if (arg.type && arg.type === "var") {
    //             args[index] = vars[arg.name];
    //           }
    //         });
    //         stack.push(fns[token.name].body.apply(null, args));
    //       }
    //       else {
    //         (function() {
    //           token.name = token.name.substring(1);            
    //           var args = [];
    //           for (var i = 1; i < fns[token.name].args + 1; i++) {
    //             args.unshift(stack[stack.length - i]);
    //           }
    //           for (var j = 0; j < args.length; stack.pop(), j++);
    //           args.forEach(function(arg, index) {
    //             if (arg.type && arg.type === "var") {
    //               args[index] = vars[arg.name];
    //             }
    //           });
    //           stack.push(function() {
    //             return fns[token.name].body.apply(null, args);
    //           });
    //         }());
    //       }
    //     }
    //     else {
    //       stack.push(token);
    //     }
    //   });
    //   return stack[stack.length - 1];
    // }());
    (function associate() {
      var stack = [];
      // console.log(input);
      input.forEach(function(token, id) {
        if (token.type && token.type === "fn" && (token.name === "set" || token.name === "`set" || token.name === "gset" || token.name === "`gset")) {
          var args = [];
          for (var i = 1; i < 3; i++) {
            args.unshift(stack[stack.length - i]);
          }
          args.push(token);
          for (var j = 1; j < args.length; stack.pop(), j++);
          stack.push(args);
        }
        else if (token.type && token.type === "fn") {
          var args = [];
          for (var i = 1; i < fns[token.name.replace(/^`/, "")].args + 1; i++) {
            args.unshift(stack[stack.length - i]);
          }
          args.push(token);
          for (var j = 1; j < args.length; stack.pop(), j++);
          stack.push(args);
        }
        else {
          stack.push(token);
        }
      });
      input = stack;
    }());
    return (function compile() {
      function compileInvocation(line) {
        var fn = line[line.length - 1];
        var deferred = fn.name.substring(0, 1) === "`";
        fn.name = fn.name.replace(/^`/, "");
        if (fn.name === "set") {
          var varName = line[0].name;
          var val = line[1];
          if (val.type && val.type === "var") {
            val = "$vars." + escapeId(val.name);
          }
          else if (val instanceof Array) {
            val = compileInvocation(val);
          }
          else if (typeof val === "string") {
            val = "\"" + val + "\"";
          }
          if (deferred) {
            return "(function() { var $val = " + val + "; return function() { $vars." + escapeId(varName) + " = $val; }; }())";
          }
          else {
            return "(function() { return $vars." + escapeId(varName) + " = " + val + "; }())";
          }
        }
        else if (fn.name === "gset") {
          var varName = line[0].name;
          var val = line[1];
          if (val.type && val.type === "var") {
            val = "$vars." + escapeId(val.name);
          }
          else if (val instanceof Array) {
            val = compileInvocation(val);
          }
          else if (typeof val === "string") {
            val = "\"" + val + "\"";
          }
          if (deferred) {
            return "(function() { var $val = " + val + "; return function() { $vars." + escapeId(varName) + " = $gvars." + escapeId(varName) + " = $val; }; }())";
          }
          else {
            return "(function() { return $vars." + escapeId(varName) + " = $gvars." + escapeId(varName) + " = " + val + "; }())";
          }
        }
        else {
          line.pop();
          var args = line;
          args.forEach(function(arg, id) {
            if (arg instanceof Array) {
              args[id] = compileInvocation(arg);
            }
            else if (arg.type && arg.type === "var") {
              args[id] = "$vars." + escapeId(arg.name);
            }
            else if (typeof arg === "string") {
              args[id] = JSON.stringify(arg);
            }
          });
          if (deferred) {
            return "(function() { var $args = [" + args.join(", ") + "]; return function() { return $fns." + escapeId(fn.name) + ".body.apply(null, $args); }; }())";
          }
          else {
            return "$fns." + escapeId(fn.name) + ".body(" + args.join(", ") + ")";
          }
        }
      }
      // console.log(JSON.stringify(input));
      input.forEach(function(line, index) {
        input[index] = compileInvocation(line);
      });
      return input.join(";\n") + ";";
    }());
  }
  var inputs = input.split(/\s*\n---[ \t]*\n\s*/);

  global.fns = require("./primitives-" + engine);
  var compiledFns = [];
  
  for (var fnName in fns) { 
    compiledFns.push("$fns." + escapeId(fnName) + " = { args:" + fns[fnName].args + ", body: " + fns[fnName].body.toString() + "}");
  }
  
  inputs.forEach(function(input) {
    input.replace(/^([^\n]*)\n([\s\S]*)$/, function(match, args, body) {
      args = args.replace(/\(|\)/g, " ").split(/\s+/);
      var label = args[args.length - 1];
      args.pop();
      var vars = Object.create(gvars);
      fns[label] = { args: args.length };
    });
  });
  inputs.forEach(function(input) {
    input.replace(/^([^\n]*)\n([\s\S]*)$/, function(match, args, body) {
      args = args.replace(/\(|\)/g, " ").replace(/(^|\s)\$/g, "$1").split(/\s+/);
      var label = args[args.length - 1];
      args.pop();
      var vars = Object.create(gvars);
      compiledFns.push(
        "$fns." + escapeId(label) + " = { args: " + args.length + ", body: function() {\n" + 
        "var $vars = Object.create($gvars);\n" +
        (function() {
          var list = [];
          args.forEach(function(arg, index) {
            list.push("$vars." + escapeId(arg) + " = arguments[" + index + "]");
          });
          return list.join(";\n") + ";\n";
        }()) +
        exec(body, fns, vars) +
        "\n}}"
      );
    });
  });
  return "var $gvars = {};\nvar $fns = {};\n" + escapeId.toString() + "\n" + compiledFns.join(";\n") + ";\n$fns.$main.body();";
};
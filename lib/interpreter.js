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
        else { console.log(match); return match; }
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
  
    return (function run() {
      var stack = [];
      input.forEach(function(token, index) {
        if (token.type && token.type === "fn" && token.name === "set") {
          var id = stack[stack.length - 2];
          var val = stack[stack.length - 1];
          if (val.type && val.type === "var") {
            val = vars[val.name];
          }
          vars[id.name] = val;
        }
        else if (token.type && token.type === "fn" && token.name === "gset") {
          var id = stack[stack.length - 2];
          var val = stack[stack.length - 1];
          if (val.type && val.type === "var") {
            val = vars[val.name];
          }
        
           vars[id.name] = gvars[id.name] = val;
        }
        else if (token.type && token.type === "fn" && token.name === "`set") {
          var id = stack[stack.length - 2];
          var val = stack[stack.length - 1];
          if (val.type && val.type === "var") {
            val = vars[val.name];
          }
          stack.pop();
          stack.pop();
          stack.push(function() {
            vars[id.name] = val;
          });
        }
        else if (token.type && token.type === "fn" && token.name === "`gset") {
          var id = stack[stack.length - 2];
          var val = stack[stack.length - 1];
          if (val.type && val.type === "var") {
            val = vars[val.name];
          }
          stack.pop();
          stack.pop();
          stack.push(function() {
            vars[id.name] = gvars[id.name] = val;
          });
        }
        else if (token.type && token.type === "fn") {
          if (token.name.substring(0, 1) !== "`") {
            var args = [];
            for (var i = 1; i < fns[token.name].args + 1; i++) {
              args.unshift(stack[stack.length - i]);
            }
            for (var j = 0; j < args.length; stack.pop(), j++);
            args.forEach(function(arg, index) {
              if (arg.type && arg.type === "var") {
                args[index] = vars[arg.name];
              }
            });
            stack.push(fns[token.name].body.apply(null, args));
          }
          else {
            (function() {
              token.name = token.name.substring(1);            
              var args = [];
              for (var i = 1; i < fns[token.name].args + 1; i++) {
                args.unshift(stack[stack.length - i]);
              }
              for (var j = 0; j < args.length; stack.pop(), j++);
              args.forEach(function(arg, index) {
                if (arg.type && arg.type === "var") {
                  args[index] = vars[arg.name];
                }
              });
              stack.push(function() {
                return fns[token.name].body.apply(null, args);
              });
            }());
          }
        }
        else {
          stack.push(token);
        }
      });
      return stack[stack.length - 1];
    }());
  }
  var inputs = input.split(/\s*\n---[ \t]*\n\s*/);

  global.fns = require("./primitives-" + engine);

  inputs.forEach(function(input) {
    input.replace(/^([^\n]*)\n([\s\S]*)$/, function(match, args, body) {
      args = args.replace(/\(|\)/g, " ").split(/\s+/);
      var label = args[args.length - 1];
      args.pop();
      fns[label] = {
        args: args.length,
        body: function() {
          var _args = arguments;
          var vars = Object.create(gvars);
          args.forEach(function(arg, index) {
            vars[arg.replace(/^\$/, "")] = _args[index];
          });
          return exec(body, fns, vars);
        }
      };
    });
  });

  fns.main.body();
};
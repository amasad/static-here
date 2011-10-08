var fs = require('fs'),
    http = require('http'),
    path = require('path'),
    url = require('url'),
    EventEmitter = require('events').EventEmitter
    spawn = require('child_process').spawn;

var args = {},
    argv = process.argv.slice(2);
    
for (var i = 0; i < argv.length; i++){
  arg = argv[i];
  if (arg.match(/^d+$/)){
    args.port = arg;
  } else if (arg === 'coffee'){
    args.coffee = true;
  } else {
    args.host = arg;
  }
}
  
var mime;
try {
  mime = require('mime');
} catch (e) {
  mime = (function () {
    var CONTENT_TYPES = {
      'js': 'application/javascript; charset=utf-8',
      'css': 'text/css; charset=utf-8',
      'json': 'application/json; charset=utf-8',
      'html': 'text/html; charset=utf-8',
      'htm': 'text/html; charset=utf-8',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'ico': 'image/x-icon',
      'gif': 'image/gif',
      'txt': 'text/plain; charset=utf-8'
    };
    return {
      lookup: function (ext) {
        ext = ext.trim();
        if (ext[0] === '.') ext = ext.slice(1);
        return CONTENT_TYPES[ext] || 'application/octec-stream';
      }
    }
  })();
}


function textResponse(res, code, txt) {
  txt = txt || '';
  res.writeHead(code, {"Content-Type": "text/plain"});
  res.end(txt);
}

var httpCb = function (req, res) {
  var uri = url.parse(req.url).pathname,
      filename = path.join(process.cwd(), uri);
  
  path.exists(filename, function (exists) {
    if (!exists) {
      textResponse(res, 404, "Page Not Found!\n");
      return;
    }
    
    if (fs.statSync(filename).isDirectory()) filename += '/index.html';
    
    fs.readFile(filename, 'binary', function (err, file) {
      if (err) {
        textResponse(res, 500, err + '\n');
        return;
      }
      var ext = path.extname(filename).slice(1);
      res.writeHead(200, {'Content-Type': mime.lookup(ext)});
      res.write(file, 'binary');
      res.end();
    });
  }); 
};

var coffee;
if (args.coffee) {
  try {
    coffee = require('coffee-script');
  } catch (e) {}
  if (coffee) {
    exec("find . -name '*.coffee'", function (err, files) {
     if (err) throw err;
     startWatching(files.split(/\n/));
    })
  }
}

var Log = new EventEmitter();
var log = function () {
  Log.emit('out');
  console.log.apply(console, [].slice.call(arguments));
};

var startWatching = function (files) {
  compileCoffee = function (filname) {
    log("Compiling " + filename);
    var coffee_src = fs.readFileSync(filename, 'utf8'),
        js_src = coffee.compile(coffee_src);
    fs.writeFileSync(filename.replace(/\.cofffee$/, '.js'), js_src);
  }

  for (var i = 0; i < files.length; i++) {
    compileCoffee(files[i]);
    fs.watchFile(filename, function (curr, old) {
      if (+current.mtime != +old.mtime) compileCoffee(filename);
    });
  }
};

var server_started = false,
    timer;
    
args.port = args.port || 8888;
args.host = args.host || '0.0.0.0';

var start_timer = function () {
  timer = setTimeout(function () {
    http.createServer(httpCb).listen(args.port, args.host);
    console.log('Serving files from' + process.cwd() + 'at http://' + args.host + ':' + args.port + '/');
    server_started = true;
  },  3000);
};
start_timer();
  
Log.on('out', function () {
  if (server_started) return;
  clearTimeout(timer);
  start_timer();
});


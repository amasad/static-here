const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');
const mime = require('mime');

const args = {
  host: '0.0.0.0',
  port: 8080,
};
const argv = process.argv.slice(2);
const cwd = process.cwd();

// Guess arguments.
for (const arg of argv) {
  if (arg.match(/^\d+$/)) {
    args.port = arg;
  } else {
    args.host = arg;
  }
}

function respond(res, code, txt, headers) {
  headers = headers || {};
  txt = txt || '';
  headers['Content-Type'] = "text/plain";
  res.writeHead(code, headers);
  res.end(txt);
}

http.createServer((req, res) => {
  const { pathname } = url.parse(req.url);
  let filename = path.join(cwd, pathname);

  fs.stat(filename, (err, stats) => {
    if (err) {
      respond(res, 404, "Page Not Found!\n");
      return;
    }

    if (stats.isDirectory()) {
      if (filename.slice(-1) !== '/') {
        // Directory with out a trailing slash.
        // redirect http://host/directory to http://host/directory/
        respond(res, 302, 'Location is a folder, redirecting..', {
          'Location': pathname + '/'
        });
        return;
      } else {
        filename = path.join(filename, 'index.html');
      }
    }

    fs.readFile(filename, 'binary', function(err, file) {
      if (err) {
        respond(res, 500, err + '\n');
        return;
      }

      res.writeHead(200, { 'Content-Type': mime.getType(filename) });
      res.write(file, 'binary');
      res.end();
    });
  });
}).listen(args.port, args.host, () => {
  console.log(
    'Serving files from %s at http://%s:%s/',
    process.cwd(),
    args.host,
    args.port
  );
});


var connect = require('connect');
var serveStatic = require('serve-static');

connect().use(serveStatic('html')).listen(9003);

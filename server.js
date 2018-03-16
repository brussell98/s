const config = require('./config/config.js');
const restify = require('restify');
const database = require(`./providers/${config.db.provider}.js`);

const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser({mapParams: true}));

require('./routes/linkRouter')(server, database, config);

database.connect(config.db);
database.initIfNeeded();
server.listen(config.server.port, () => console.log('S| Server listening on port', config.server.port));

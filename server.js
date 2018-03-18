const config = require('./config/config.js');
const restify = require('restify');
const database = require(`./providers/${config.db.provider}.js`);

const server = restify.createServer();

server.use(restify.plugins.bodyParser());
server.use(restify.plugins.queryParser({mapParams: true}));
server.use(restify.plugins.throttle({
	burst: 4, // Max 4 requests at once
	rate: 2, // 2 req / sec
	xff: true,
	setHeaders: true
}));
server.use(async (req, res, next) => {
	const token = req.header('authorization');

	if (token) {
		const user = await database.getUserByToken(token);
		req.username = user.id;
	}

	return next();
});

require('./routes/linkRouter')(server, database, config);

database.connect(config.db);
database.initIfNeeded();
server.listen(config.server.port, () => console.log('S| Server listening on port', config.server.port));

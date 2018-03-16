const { isValidId, isValidUrl } = require('../utils/utils.js');

module.exports = function(server, database, config) {
	server.get('/l/:id', async (req, res, next) => {
		let link;
		if (isValidId(req.params.id))
			link = await database.getLink(req.params.id, true);

		if (link)
			return res.redirect(301, link.expanded, next);

		res.status(404);
		res.send();

		return next();
	});

	server.get('/l/:id/info', async (req, res, next) => {
		let link;
		if (isValidId(req.params.id))
			link = await database.getLink(req.params.id, true);

		if (link) {
			res.json({
				id: link._id,
				expanded: link.expanded,
				createdAt: link.createdAt,
				visits: link.visits
			});
		} else {
			res.status(404);
			res.json({ message: 'Invalid id' });
		}

		return next();
	});

	server.post('/l/shorten', async (req, res, next) => {
		if (!isValidUrl(req.body.url)) {
			res.status(404);
			res.json({ message: 'Valid url required' });
			return next();
		}

		if (config.requireAuth) {
			res.status(401);
			res.json({ message: 'Shortening links requires an account' });
			return next();
		}

		const link = await database.createLink(req.body.url)

		res.status(201);
		res.json({
			id: link._id,
			expanded: link.expanded,
			createdAt: link.createdAt,
			visits: link.visits
		});
		return next();
	});
}

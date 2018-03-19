const { isValidId, isValidUrl, requireAuth } = require('../utils/utils.js');
const { plugins } = require('restify');

module.exports = function(server, database, config) {
	server.get(/(?:\/api)?\/(?:link|l)\/([a-zA-Z0-9]+)(?:\?.+|$)/, plugins.throttle({ burst: 0, rate: 0 }), async (req, res, next) => {
		req.params.id = req.params[0];

		let link;
		if (isValidId(req.params.id))
			link = await database.getLink(req.params.id, true);

		if (link)
			return res.redirect(301, link.expanded, next);

		res.status(404);
		res.send();

		return next();
	});

	server.get('/api/link/:id/info', async (req, res, next) => {
		let link;
		if (isValidId(req.params.id))
			link = await database.getLink(req.params.id, true);

		if (link) {
			res.json({
				id: link._id,
				ownerId: link.ownerId,
				expanded: link.expanded,
				createdAt: link.createdAt,
				visits: link.visits
			});
		} else {
			res.status(404);
			res.json({ message: 'Invalid link id' });
		}

		return next();
	});

	server.get('/api/user/:id/links', requireAuth, async (req, res, next) => {
		if (req.username !== req.params.id) {
			res.status(401);
			res.json({ message: 'You can only request your own links' });
			return next();
		}

		res.json(await database.getLinksByOwner(req.params.id));
		return next();
	});

	server.post('/api/shorten', plugins.throttle({ burst: 2, rate: 1, xff: true }), async (req, res, next) => {
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

		const link = await database.createLink(req.body.url, req.username);

		res.status(201);
		res.json({
			id: link._id,
			ownerId: link.ownerId,
			expanded: link.expanded,
			createdAt: link.createdAt,
			visits: link.visits
		});
		return next();
	});

	server.delete('/api/link/:id', requireAuth, async (req, res, next) => {
		if (!isValidId(req.params.id)) {
			res.status(404);
			res.json({ message: 'Invalid link id' });
			return next();
		}

		const result = await database.deleteLink(req.params.id, req.username);

		if (result === 200)
			res.json({ message: 'Link deleted' });
		else if (result === 401) {
			res.status(401);
			res.json({ message: 'You are not the owner of this link' });
		} else {
			res.status(404);
			res.json({ message: 'Invalid link id' });
		}

		return next();
	});
}

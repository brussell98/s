const bcrypt = require('bcrypt');
const saltRounds = 10;
const crypto = require('crypto');
const shortid = require('shortid');
const { isValidPassword, isValidUsername, requireAuth } = require('../utils/utils.js');
const { plugins } = require('restify');

module.exports = function(server, database, config) {
	server.post('/api/auth', async (req, res, next) => {
		if (!isValidUsername(req.body.username) || !isValidPassword(req.body.password)) {
			res.status(401);
			res.json({ message: 'Invalid username or password' });
			return next();
		}

		const user = await database.getUserByName(req.body.username, { dangerousFields: true });

		if (await bcrypt.compare(req.body.password, user.password))
			res.json({ token: user.token });
		else {
			res.status(401);
			res.json({ message: 'Invalid password' });
		}

		return next();
	});

	server.post('/api/register', plugins.throttle({ burst: 1, rate: 0.5, xff: true }), async (req, res, next) => {
		if (!config.allowNewUsers) {
			res.status(401);
			res.json({ message: 'Account creation is not allowed' });
			return next();
		}

		if (!isValidUsername(req.body.username) || !isValidPassword(req.body.password)) {
			res.status(401);
			res.json({ message: 'Usernames must be from 4 to 40 characters. Passwords must be from 8 to 72 characters and not contain only letters or numbers' });
			return next();
		}

		if (await database.getUserByName(req.body.username)) {
			res.status(400);
			res.json({ message: 'Username not available' });
			return next();
		}

		const user = await database.createUser({
			_id: shortid.generate(),
			username: req.body.username.trim(),
			password: await bcrypt.hash(req.body.password, saltRounds),
			token: crypto.randomBytes(32 / 2).toString('hex').slice(0, 32)
		});

		res.status(201);
		res.json({
			id: user._id,
			token: user.token,
			createdAt: user.createdAt
		});

		return next();
	});

	server.patch('/api/user/:id/password', requireAuth, async (req, res, next) => {
		if (!isValidPassword(req.body.password) || !isValidPassword(req.body.newPassword)) {
			res.status(400);
			res.json({ message: 'Passwords must be from 8 to 72 characters and not contain only letters or numbers' });
			return next();
		}

		const user = await database.getUserById(req.params.id, { dangerousFields: true });

		if (await bcrypt.compare(req.body.password, user.password)) {
			const token = crypto.randomBytes(32 / 2).toString('hex').slice(0, 32);

			await database.updateUser(req.params.id, {
				token,
				password: await bcrypt.hash(req.body.newPassword, saltRounds)
			});

			res.json({ token });
		} else {
			res.status(401);
			res.json({ message: 'Wrong password' });
		}

		return next();
	});
}

const mongoose = require('mongoose');
const base58 = require('../utils/base58.js');

const Link = mongoose.model('links', new mongoose.Schema({
	_id: { type: String, required: true },
	expanded: { type: String, required: true },
	visits: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now() }
}));

const Counter = mongoose.model('counters', new mongoose.Schema({
	_id: { type: String, required: true },
	seq: { type: Number, default: 10000 }
}));

const User = mongoose.model('users', new mongoose.Schema({
	_id: String,
	password: { type: String, select: false },
	username: { type: String, maxlength: 40, minlength: 4, trim: true, unique: true, index: { unique: true } },
	token: { type: String, select: false, unique: true, index: { unique: true } },
	createdAt: { type: Date, default: Date.now }
}));

function connect(config) {
	mongoose.connect(`mongodb://${config.user}:${config.pass}@${config.host}:${config.port}/${config.database}?authSource=admin`);

	mongoose.connection.on('error', console.error.bind(console, 's| Database connection error:'));
	mongoose.connection.once('open', () => console.log('s| Database connection established'));

	return;
}

/**
 * Set up the database for use
 * @async
 */
async function initIfNeeded() {
	const linkCount = await Counter.findById('linkCount');

	if (!linkCount) {
		await Counter.create({ _id: 'linkCount' });
		console.log('s| Link counter created with default value of 10000');
	}

	return;
}

/**
 * Returns a Link document
 * @param {String} id - The link id
 * @param {Boolean} [increment=false] - Increment the link's visit count
 * @returns {Promise<DocumentQuery>} The Link document
 */
function getLink(id, increment=false) {
	return increment ? Link.findByIdAndUpdate(id, { $inc: { visits: 1 } }) : Link.findById(id);
}

/**
 * Creates a Link document
 * @async
 * @param {String} url - Url to shorten
 * @returns {Promise<DocumentQuery>} The new Link document
 */
async function createLink(url) {
	const nextInSeq = (await Counter.findByIdAndUpdate('linkCount', { $inc: { seq: 1 } }, { new: true })).seq;
	return await Link.create({
		_id: base58.encode(nextInSeq),
		expanded: url
	});
}

/**
 * Returns a User document
 * @async
 * @param {String} id - The user's id
 * @param {Object} [options]
 * @param {Boolean} [options.dangerousFields=false] - Return token and hashed password
 * @returns {Promise<DocumentQuery>} The User document
 */
async function getUserById(id, options = { }) {
	if (options.dangerousFields)
		return User.findOne({ _id: id }).select('+password +token');
	return User.findOne({ _id: id }).select('-password -token');
}

/**
 * Returns a User document
 * @async
 * @param {String} username - The user's name
 * @param {Object} [options]
 * @param {Boolean} [options.dangerousFields=false] - Return token and hashed password
 * @returns {Promise<DocumentQuery>} The User document
 */
async function getUserByName(username, options = { }) {
	if (options.dangerousFields)
		return User.findOne({ username }).select('+password +token');
	return User.findOne({ username }).select('-password -token');
}

/**
 * Creates a User document
 * @param {Object} data - Data to store in the document
 * @returns {Promise<DocumentQuery>} The new Link document
 */
function createUser(data) {
	return User.create(data);
}

/**
 * Updates a User document
 * @async
 * @param {String} id - The user's id
 * @param {Object} data - Data to store in the document
 * @returns {Promise<DocumentQuery>} The updated User document
 */
function updateUser(id, data) {
	return User.findByIdAndUpdate(id, data, { new: true });
}

module.exports = {
	connect,
	initIfNeeded,
	getLink,
	createLink,
	getUserById,
	getUserByName,
	createUser,
	updateUser
};

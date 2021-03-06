const mongoose = require('mongoose');
const base58 = require('../utils/base58.js');

/**
 * A document representing a shortened URL
 * @typedef {Object} Link
 * @property {String} _id - The short id
 * @property {String} [ownerId] - The user id of the link owner
 * @property {String} expanded - The full URL that visitors will be redirected to
 * @property {Number} visits - How many times the link has been visited
 * @property {Date} createdAt - Creation timestamp
 */
const Link = mongoose.model('links', new mongoose.Schema({
	_id: { type: String, required: true },
	ownerId: String,
	expanded: { type: String, required: true },
	visits: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now() }
}));

const Counter = mongoose.model('counters', new mongoose.Schema({
	_id: { type: String, required: true },
	seq: { type: Number, default: 10000 }
}));

/**
 * A user
 * @typedef {Object} User
 * @property {String} _id - The user's id
 * @property {String} password - The user's password hash
 * @property {String} username - The user's display name
 * @property {String} token - The user's auth token
 * @property {Date} createdAt - Creation timestamp
 */
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
 * Transforms a document for use in the api
 * @param {Document} doc - The raw document
 * @returns {Promise<Document>} The transformed document
 */
function transform(doc) {
	if (!doc)
		return doc;

	doc.id = doc._id;
	delete doc._id;
	return doc;
}

/**
 * Transforms documents for use in the api
 * @param {DocumentArray} docs - The raw documents
 * @returns {Promise<DocumentArray>} The transformed documents
 */
function transformDocs(docs) {
	return docs.map(transform);
}

/**
 * Returns a Link document
 * @async
 * @param {String} id - The link id
 * @param {Boolean} [increment=false] - Increment the link's visit count
 * @returns {Promise<Link>} The Link document
 */
async function getLink(id, increment=false) {
	return transform(await (increment
		? Link.findByIdAndUpdate(id, { $inc: { visits: 1 } }).select('-__v').lean()
		: Link.findById(id).select('-__v').lean()));
}

/**
 * Returns an array of Link documents
 * @async
 * @param {String} ownerId - The user id to get documents for
 * @returns {Promise<Array<Link>>} An array of link documents
 */
async function getLinksByOwner(ownerId) {
	return transformDocs(await Link.find({ ownerId }).select('-__v').lean());
}

/**
 * Creates a Link document
 * @async
 * @param {String} url - Url to shorten
 * @param {String} [userId] - The userId to assign the link to
 * @returns {Promise<Link>} The new Link document
 */
async function createLink(url, userId) {
	const nextInSeq = (await Counter.findByIdAndUpdate('linkCount', { $inc: { seq: 1 } }, { new: true })).seq;
	const newLink = await Link.create({
		_id: base58.encode(nextInSeq),
		ownerId: userId || undefined,
		expanded: url,
		createdAt: Date.now()
	});

	return {
		id: newLink._id,
		ownerId: newLink.ownerId,
		expanded: newLink.expanded,
		visits: newLink.visits,
		createdAt: newLink.createdAt
	};
}

/**
 * Deletes a Link document
 * @async
 * @param {String} id - Link id
 * @param {String} userId - The user that requested the deletion
 * @returns {String} The result as a status code
 */
async function deleteLink(id, userId) {
	const link = await Link.findById(id);

	if (!link)
		return 404;

	if (link.ownerId !== userId)
		return 401;

	await link.remove();
	return 200;
}

/**
 * Returns a User document
 * @async
 * @param {String} id - The user's id
 * @param {Object} [options]
 * @param {Boolean} [options.dangerousFields=false] - Return token and hashed password
 * @returns {Promise<User>} The User document
 */
async function getUserById(id, options = { }) {
	if (options.dangerousFields)
		return transform(await User.findOne({ _id: id }).select('+password +token -__v'));
	return transform(await User.findOne({ _id: id }).select('-password -token -__v'));
}

/**
 * Returns a User document
 * @async
 * @param {String} username - The user's name
 * @param {Object} [options]
 * @param {Boolean} [options.dangerousFields=false] - Return token and hashed password
 * @returns {Promise<User>} The User document
 */
async function getUserByName(username, options = { }) {
	if (options.dangerousFields)
		return transform(await User.findOne({ username }).select('+password +token -__v'));
	return transform(await User.findOne({ username }).select('-password -token -__v'));
}

/**
 * Returns a User document
 * @async
 * @param {String} token - The user's token
 * @param {Object} [options]
 * @param {Boolean} [options.dangerousFields=false] - Return token and hashed password
 * @returns {Promise<User>} The User document
 */
async function getUserByToken(token, options = { }) {
	if (options.dangerousFields)
		return transform(await User.findOne({ token }).select('+password +token -__v'));
	return transform(await User.findOne({ token }).select('-password -token -__v'));
}

/**
 * Creates a User document
 * @async
 * @param {Object} data - Data for the new User document
 * @returns {Promise<User>} The new user's data
 */
async function createUser(data) {
	const newUser = await User.create({
		_id: data.id,
		username: data.username,
		password: data.password,
		token: data.token,
		createdAt: Date.now()
	});

	return transform(newUser);
}

/**
 * Updates a User document
 * @async
 * @param {String} id - The user's id
 * @param {Object} data - Data to store in the document
 * @returns {Promise<User>} The updated User document
 */
async function updateUser(id, data) {
	const updatedUser = User.findByIdAndUpdate(id, data, { new: true }).select('-__v').lean();

	return transform(updatedUser);
}

module.exports = {
	connect,
	initIfNeeded,
	getLink,
	getLinksByOwner,
	createLink,
	deleteLink,
	getUserById,
	getUserByName,
	getUserByToken,
	createUser,
	updateUser
};

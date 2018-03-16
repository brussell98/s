module.exports = {
	server: {
		port: 8080
	},
	db: {
		provider: 'mongodb', // mongodb
		host: 'localhost',
		port: 27017,
		user: 'username',
		pass: 'password',
		database: 'short' // MongoDB database
	},
	requireAuth: false, // Require an account to shorten links
	allowNewUsers: true // Allow new accounts to be created
};

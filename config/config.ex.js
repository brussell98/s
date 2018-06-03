module.exports = {
	server: {
		port: 8080,
		serveWebFiles: true // Disable this if you're using something like Nginx to serve the website or have a custom front-end
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

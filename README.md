<p align="center">
	<img src="https://github.com/brussell98/s/blob/master/logo.png?raw=true"/>
</p>

# Short and simple link shortening

**s** provides an easy way to set up a self-hosted link shortener on your server.

**s** uses a JavaScript [Restify](http://restify.com/) server for the back-end. The front-end is built with [VueJS](https://vuejs.org/), and uses [Vuetify](https://vuetifyjs.com/) for the UI.

## Installation

> **s** requires [NodeJS](https://nodejs.org/en/) to be installed. Version 8+ is recommended.

1. Install the dependencies by running `yarn` or `npm i --production`
2. Copy `config/config.ex.js` to `config/config.js` and edit the config to your needs
3. Run **s** with `yarn run` or `node ./server.js` or `pm2 ./pm2.json`

## Planned Features

Support for multiple databases

- [x] MongoDB
- [ ] PostgreSQL

API Server

- [ ] Restify server
	- [x] Visit link
	- [x] Shorten url
	- [x] Delete link
	- [x] Create account
	- [x] Authenticate
	- [x] Change password
	- [x] Get links for user
	- [ ] Ratelimit
		- [ ] Custom ratelimiter that isn't garbage

- [ ] Express re-write
	- [ ] Link routes
	- [ ] Authentication routes
	- [ ] Authentication handler
	- [ ] Rate-limiting with per-route options
	- [ ] Optional static file serving

- [x] Short id generator

Website

- [x] Main functions
	- [x] Shorten link
		- [x] URL Validation
	- [x] View links
	- [x] Delete links
- [x] Accounts
	- [x] Create
	- [x] Log in
	- [x] Change password
- [ ] Error/failure display

Link analytics

- [x] Link visited
- [x] Created at

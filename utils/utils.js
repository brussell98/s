const alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const validChars = alphabet.split('');

const UrlRegex = new RegExp('^(https?:\\/\\/)?'+ // protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
	'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	'(\\:\\d+)?'+ // port
	'(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
	'(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
	'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
const validPassRegex = new RegExp('^([a-z]+|\\d+)$', 'i'); // Doesn't contain only letters or numbers

function isValidId(input) {
	return typeof input === 'string' && input.split('').every(c => validChars.includes(c));
}

function isValidUrl(input) {
	return typeof input === 'string' && UrlRegex.test(input);
}

function isValidPassword(input) {
	return typeof input === 'string' && input.length >= 8 && input.length <= 72 && validPassRegex.test(input);
}

function isValidUsername(input) {
	return typeof input === 'string' && input.trim().length >= 4 && input.trim().length <= 40;
}

module.exports = { isValidId, isValidUrl, isValidPassword, isValidUsername };

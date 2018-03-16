const alphabet = '123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
const validChars = alphabet.split('');

const UrlRegex = new RegExp('^(https?:\\/\\/)?'+ // protocol
	'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
	'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	'(\\:\\d+)?'+ // port
	'(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
	'(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
	'(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

function isValidId(input) {
	return typeof input === 'string' && input.split('').every(c => validChars.includes(c));
}

function isValidUrl(input) {
	return typeof input === 'string' && UrlRegex.test(input);
}

module.exports = { isValidId, isValidUrl };

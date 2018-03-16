const chars = "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";
const base = chars.length; // 58

function encode(number) {
	let encoded = '';

	while (number) {
		const remainder = number % base;
		number = Math.floor(number / base);
		encoded = chars[remainder] + encoded;
	}

	return encoded;
}

function decode(string) {
	let decoded = 0;

	while (string) {
		decoded += chars.indexOf(string[0]) * Math.pow(base, string.length - 1);
		string = string.substring(1);
	}

	return decoded;
}

module.exports = { encode, decode };

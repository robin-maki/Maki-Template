var check = [/</g,/>/g,/&/g,/"/g,/&lt;/g,/&gt;/g,/&amp;/g,/&quot;/g];
exports.escape = function (str) {
	str = str.replace(check[0], "&lt;");
	str = str.replace(check[1], "&gt;");
	str = str.replace(check[2], "&amp;");
	str = str.replace(check[3], "&quot;");
	return str;
};
exports.unEscape = function (str) {
	str = str.replace(check[4], "<");
	str = str.replace(check[5], ">");
	str = str.replace(check[6], "&");
	str = str.replace(check[7], '"');
	return str;
};
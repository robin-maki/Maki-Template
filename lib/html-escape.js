var check = [/</g,/>/g,/&/g,/"/g,/'/g,/&lt;/g,/&gt;/g,/&amp;/g,/&quot;/g,/&apos;/g];
exports.escape = function (str) {
	str = String(str);
	str = str.replace(check[0], "&lt;");
	str = str.replace(check[1], "&gt;");
	str = str.replace(check[2], "&amp;");
	str = str.replace(check[3], "&quot;");
	str = str.replace(check[4], "&apos;");
	return str;
};
exports.unEscape = function (str) {
	str = String(str);
	str = str.replace(check[5], "<");
	str = str.replace(check[6], ">");
	str = str.replace(check[7], "&");
	str = str.replace(check[8], '"');
	str = str.replace(check[9], "'");
	return str;
};
var check = [/</g,/>/g,/&/g,/ /g,/"/g];
exports = function (str) {
	str = str.replace(check[0], "&lt;");
	str = str.replace(check[1], "&gt;");
	str = str.replace(check[2], "&amp;");
	str = str.replace(check[3], "&nbsp;");
	str = str.replace(check[4], "&quot;");
	return str;
};
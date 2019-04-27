myhtml = `
<html>
<body>
<br>
Flash
<a href="go.html">go</a>
</body>

</html>
`;

function webpage() {
}

webpage.prototype.gethtml = function () {
return myhtml;
};

exports = webpage;
myhtml = `
<html>
hello
</html>
`;

function webpage() {
    //print('MPPT web page');
}

webpage.prototype.gethtml = function () {
    return myhtml;
};

exports = webpage;

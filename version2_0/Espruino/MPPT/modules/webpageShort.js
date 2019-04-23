myhtml = `
<html> <body>  <div style="display: table;">  <div style="display: table-row">   Date  <span id="clientDate"></span>  </div>  <div style="display: table-cell; ">  <button>Settings</button>  </div>  </div> </body> </html>
`;
function webpage() {
}

webpage.prototype.gethtml = function () {
    return myhtml;
};

exports = webpage;
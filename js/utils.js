// Calculate the appropriate font size to satisfy the following:
// - Fit exactly 80 chars horizontally
// - Fit at least 24 chars vertically
function getFontSize() {
    const paddingSize = 80;
    var width = window.innerWidth - paddingSize;
    var height = window.innerHeight - paddingSize;
    var widthBasedSize = (width / 40) * 0.84;
    var heightBasedSize = (height / 24) * 0.84;
    if (widthBasedSize < heightBasedSize) {
        return Math.trunc(widthBasedSize);
    } else {
        return Math.trunc(heightBasedSize);
    }
}

// Calculate the number of rows for the terminal to fit vertically.
function getNumRows(fontSize) {
    const paddingSize = 80;
    var height = window.innerHeight - paddingSize;
    var numRows = height / fontSize * 0.84;
    if (numRows < 24) {
        return 24;
    } else {
        return Math.trunc(numRows);
    }
}

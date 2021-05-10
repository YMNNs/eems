Array.prototype.isInArray = function (obj) {
    var index = this.length;
    while (index--) {
        if (this[index] === obj) {
            return true;
        }
    }
    return false;
}
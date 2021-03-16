
Number.prototype.round = function(decimals: number){
    return parseFloat(Math.round(parseFloat(this + "e" + decimals)) + "e-" + decimals);
}
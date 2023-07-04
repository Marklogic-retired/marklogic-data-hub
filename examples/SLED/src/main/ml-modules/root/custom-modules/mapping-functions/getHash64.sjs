'use strict';
function getHash64(str){
    if(str instanceof NullNode) {
        return null;
    }
    if (str==null) {
        return 'null';
    }
    if (str=='') { return '';}
    let v = ""+xdmp.hash64(fn.string(str));
    return v;
}
module.exports = {
    getHash64
  }
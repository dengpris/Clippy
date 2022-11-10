class GlobalArray { 
    constructor(){
        this.array = [];
    }
    Add(item) {
        this.array.push(item);
    }
    Get(){
        return this.array;
    }
}

let globalArray = new GlobalArray();
module.exports = globalArray;
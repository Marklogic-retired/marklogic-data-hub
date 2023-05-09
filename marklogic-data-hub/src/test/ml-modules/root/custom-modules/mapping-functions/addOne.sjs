function addOne(numSequence) {
  let numArray = numSequence.toObject().map((num) =>  num + 1);
  return Sequence.from(numArray);
}

module.exports = {
  addOne
};
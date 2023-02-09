function addOne(numSequence) {
  let numArray = numSequence.toObject().map((num) => { return num +1 });
  return Sequence.from(numArray);
}

module.exports = {
  addOne
};
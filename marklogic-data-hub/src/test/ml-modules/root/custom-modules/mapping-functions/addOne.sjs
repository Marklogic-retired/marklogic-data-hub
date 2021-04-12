function addOne(numSequence) {
  numSequence = numSequence.toObject();
  numSequence = numSequence.map((num)=> {
    return num +1 });
  return Sequence.from(numSequence);
}

module.exports = {
  addOne
};

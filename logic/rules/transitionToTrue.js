
const createTransitionToTrue = (evaluator, data, actionOnTrue, rate) => {
  let truth = false;
  const handle = setInterval(() => {
    let newTruth = evaluator(data);
    if (truth === false && newTruth === true){
      actionOnTrue(data);
    }
    truth = newTruth;
  }, rate);
  return handle;
};

module.exports = createTransitionToTrue;
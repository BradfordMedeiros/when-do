
const createTransitionToFalse = (evaluator, data, actionOnTrue, rate) => {
  let truth = false;
  const handle = setInterval(() => {
    let newTruth = evaluator(data);
    if (truth === true && newTruth === false){
      actionOnTrue(data);
    }
    truth = newTruth;
  }, rate);
  return handle;
};

module.exports = createTransitionToFalse;
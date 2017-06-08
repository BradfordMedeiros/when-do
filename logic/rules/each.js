
const createEval = (evaluator, data, actionOnTrue, rate) => {
  const handle =  setInterval(() => {
    if (evaluator(data)){
      actionOnTrue(data);
    }
  }, rate);
  return handle;
};

module.exports = createEval;
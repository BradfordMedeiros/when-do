const getEval = (createEval, evaluator, data, actionOnTrue, rate) => {
  let evaluatorHandle = createEval(evaluator, data, actionOnTrue, rate);

  const evalData = {
    state: 'active',
  };

  return ({
    resume: () => {
      if (evalData.state === 'paused') {
        evaluatorHandle = createEval(evaluator, data, actionOnTrue, rate);
      } else {
        throw (new Error('Stopped actions cannot be resumed'))
      }
      evalData.state = 'active';
    },
    pause: () => {
      if (evalData.state === 'active') {
        clearInterval(evaluatorHandle);
        evaluatorHandle = undefined;
      } else {
        throw (new Error('Cannot pause a stopped condition'))
      }
      evalData.state = 'paused';
    },
    stop: () => {
      if (evalData.state === 'active') {
        clearInterval(evaluatorHandle);
        evaluatorHandle = undefined;
      }
      evalData.state = 'stopped';
    },
    get_state: () => {
      return evalData.state;
    },
  })
};

module.exports = getEval;
const each = require('./rules/each');
const transitionToTrue = require('./rules/transitionToTrue');
const transitionToFalse  = require('./rules/transitionToFalse');

const getEval = require('./getEval');

const when = {
  each: (evaluator, data, actionOnTrue, rate) => {
    return ({
      do: (actionOnTrue, rate) => {
        const when = getEval(each, evaluator, data, actionOnTrue, rate);
        return when;
      }
    })
  },
  transitionToTrue: (evaluator, data, actionOnTrue, rate) => {
    return ({
      do: (actionOnTrue, rate) => {
        const when = getEval(transitionToTrue, evaluator, data, actionOnTrue, rate);
        return when;
      }
    });
  },
  transitionToFalse: (evaluator, data, actionOnTrue, rate) => {
    return ({
      do: (actionOnTrue, rate) => {
        const when = getEval(transitionToFalse, evaluator, data, actionOnTrue, rate);
        return when;
      }
    })
  },
};

module.exports = when;
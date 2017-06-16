const each = require('./rules/each');
const transitionToTrue = require('./rules/transitionToTrue');
const transitionToFalse  = require('./rules/transitionToFalse');

const getEval = require('./getEval');

const when = {
  each: (evaluator, data, rate) => {
    return ({
      do: (actionOnTrue) => {
        const when = getEval(each, evaluator, data, actionOnTrue, rate);
        return when;
      }
    })
  },
  transitionToTrue: (evaluator, data, rate) => {
    return ({
      do: (actionOnTrue) => {
        const when = getEval(transitionToTrue, evaluator, data, actionOnTrue, rate);
        return when;
      }
    });
  },
  transitionToFalse: (evaluator, data, rate) => {
    return ({
      do: (actionOnTrue) => {
        const when = getEval(transitionToFalse, evaluator, data, actionOnTrue, rate);
        return when;
      }
    })
  },
};

module.exports = when;
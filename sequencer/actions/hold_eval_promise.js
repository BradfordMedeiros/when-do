
const create_hold_eval_promise = hold_eval => {
  if (typeof(hold_eval) !== 'function'){
    throw (new Error('hold_eval should be instance of eval'));
  }else{
    const the_promise = new Promise((resolve,reject) => {
      const holdEvalPromise = hold_eval();
      holdEvalPromise.then((x)=>resolve(x));
      holdEvalPromise.catch((x)=>reject(x));
    });
    return the_promise;
  }
};

module.exports =  create_hold_eval_promise;

const create_hold_promise = hold_promise => {
  if (!( hold_promise instanceof Promise )){
    throw (new Error('hold should be instance of promise'));
  }else{
    const the_promise = new Promise((resolve,reject) => {
      hold_promise.then((x)=>resolve(x));
      hold_promise.catch((x)=>reject(x));
    });
    return the_promise;
  }
};

module.exports =  create_hold_promise;
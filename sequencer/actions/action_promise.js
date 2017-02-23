
const create_action_promise = (action) => {
  const value = action();
  const the_promise = new Promise((resolve,reject) => resolve());
  return the_promise;
};

module.exports =  create_action_promise;
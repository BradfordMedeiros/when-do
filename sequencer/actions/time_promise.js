
const create_time_promise = (time) => {
  const the_promise =  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time);
  });
  return the_promise;
};

module.exports = create_time_promise;
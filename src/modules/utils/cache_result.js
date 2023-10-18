//===========================================================================
//  
//===========================================================================
const cacheResult = (fn) => {
  const cahced_result = {};
  return (...args) => {
    const _args = JSON.stringify(args);

    if (cahced_result[_args] === undefined) {
      cahced_result[_args] = fn(...args);
    }
    return cahced_result[_args];
  };
}

const cacheResultAsync = (fn) => {
  let cahced_result = {};
  return async (...args) => {
    const _args = JSON.stringify(args);

    if (cahced_result[_args] === undefined) {
      cahced_result[_args] = await fn(...args);
    }
    return cahced_result[_args];
  };
}

module.exports = { cacheResult, cacheResultAsync };
//===========================================================================
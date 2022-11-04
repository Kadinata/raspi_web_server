//===========================================================================
//  
//===========================================================================

const cacheResult = (fn) => {
  let cahced_result = null;
  return (...args) => {
    if (cahced_result === null) {
      cahced_result = fn(...args);
    }
    return cahced_result;
  };
}

const cacheResultAsync = (fn) => {
  let cahced_result = null;
  return async (...args) => {
    if (cahced_result === null) {
      cahced_result = await fn(...args);
    }
    return cahced_result;
  };
}

module.exports = { cacheResult, cacheResultAsync };
//===========================================================================
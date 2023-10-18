//===========================================================================
//  
//===========================================================================
const { cacheResult, cacheResultAsync } = require('../../../src/modules/utils/cache_result');

const ARG_1 = 2;
const ARG_2 = "2";
const ARG_3 = {"2": 2};
const ARG_4 = [2, 2];
const RET_1 = "This is return value 1";
const RET_2 = "This is return value 2";
const RET_3 = "This is return value 3";
const RET_4 = "This is return value 4";

const TEST_FN = jest.fn((args) => {
  if (args === ARG_1) {
    return RET_1;
  }
  else if (args === ARG_2) {
    return RET_2;
  }
  else if (args === ARG_3) {
    return RET_3;
  }
  else if (args === ARG_4) {
    return RET_4;
  }
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Caching utility function tests', () => {
  it('should cache synchronous function return values successfully', () => {
    const memoized_fn = cacheResult(TEST_FN);
    expect(TEST_FN).toHaveBeenCalledTimes(0);

    expect(memoized_fn(ARG_1)).toEqual(RET_1);
    expect(TEST_FN).toHaveBeenCalledTimes(1);
    expect(memoized_fn(ARG_1)).toEqual(RET_1);
    expect(TEST_FN).toHaveBeenCalledTimes(1);

    expect(memoized_fn(ARG_2)).toEqual(RET_2);
    expect(TEST_FN).toHaveBeenCalledTimes(2);
    expect(memoized_fn(ARG_2)).toEqual(RET_2);
    expect(TEST_FN).toHaveBeenCalledTimes(2);

    expect(memoized_fn(ARG_3)).toEqual(RET_3);
    expect(TEST_FN).toHaveBeenCalledTimes(3);
    expect(memoized_fn(ARG_3)).toEqual(RET_3);
    expect(TEST_FN).toHaveBeenCalledTimes(3);

    expect(memoized_fn(ARG_4)).toEqual(RET_4);
    expect(TEST_FN).toHaveBeenCalledTimes(4);
    expect(memoized_fn(ARG_4)).toEqual(RET_4);
    expect(TEST_FN).toHaveBeenCalledTimes(4);
  });

  it('should cache async function return values successfully', async () => {
    const memoized_fn = cacheResultAsync(TEST_FN);
    expect(TEST_FN).toHaveBeenCalledTimes(0);

    await expect(memoized_fn(ARG_1)).resolves.toEqual(RET_1);
    expect(TEST_FN).toHaveBeenCalledTimes(1);
    await expect(memoized_fn(ARG_1)).resolves.toEqual(RET_1);
    expect(TEST_FN).toHaveBeenCalledTimes(1);

    await expect(memoized_fn(ARG_2)).resolves.toEqual(RET_2);
    expect(TEST_FN).toHaveBeenCalledTimes(2);
    await expect(memoized_fn(ARG_2)).resolves.toEqual(RET_2);
    expect(TEST_FN).toHaveBeenCalledTimes(2);

    await expect(memoized_fn(ARG_3)).resolves.toEqual(RET_3);
    expect(TEST_FN).toHaveBeenCalledTimes(3);
    await expect(memoized_fn(ARG_3)).resolves.toEqual(RET_3);
    expect(TEST_FN).toHaveBeenCalledTimes(3);

    await expect(memoized_fn(ARG_4)).resolves.toEqual(RET_4);
    expect(TEST_FN).toHaveBeenCalledTimes(4);
    await expect(memoized_fn(ARG_4)).resolves.toEqual(RET_4);
    expect(TEST_FN).toHaveBeenCalledTimes(4);
  });
});
//===========================================================================
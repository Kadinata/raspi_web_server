//===========================================================================
//
//===========================================================================
const Gpio = jest.fn((pin_number, direction, edge, options) => {

  const create_pin = (args) => {
    const _pin_number = args.pin_number;
    let _direction = args.direction;
    let _edge = args.edge;
    let _options = { ...args.options };
    let _level = 0;
    let _callbacks = [];

    const toggle = (level) => {
      if (_direction !== 'in') return;
      _level = !!level ? 1 : 0;
      _callbacks.forEach((callback) => callback(null, _level));
    };

    const getState = () => ({
      pin_number: _pin_number,
      direction: _direction,
      level: _level,
    });

    const direction = jest.fn(() => _direction);

    const setDirection = jest.fn((direction) => {
      _direction = direction;
    });

    const writeSync = jest.fn((level) => {
      if (_direction !== 'out') return;
      _level = !!level ? 1 : 0;
      _callbacks.forEach((callback) => callback(null, _level));
    });

    const readSync = jest.fn(() => _level);

    const watch = jest.fn((callback) => {
      if (typeof callback !== 'function') return;
      _callbacks.push(callback);
    });

    const unwatch = jest.fn(() => {
      _callbacks = [];
    });


    const unexport = jest.fn();

    return ({
      toggle,
      getState,
      direction,
      setDirection,
      writeSync,
      readSync,
      watch,
      unwatch,
      unexport,
    });
  };

  return create_pin({ pin_number, direction, edge, options });
});

module.exports = { Gpio };
//===========================================================================
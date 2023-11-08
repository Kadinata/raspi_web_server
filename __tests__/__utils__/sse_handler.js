//===========================================================================
//  
//===========================================================================
const MockSSEHandler = (name) => {
  const _name = name;

  subscribe = jest.fn((subject, res) => {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
  });

  getName = jest.fn(() => _name);

  return { subscribe, getName };
};

module.exports = MockSSEHandler;
//===========================================================================
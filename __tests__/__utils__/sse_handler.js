//===========================================================================
//  
//===========================================================================
const MockSSEHandler = (name) => {
  const _name = name;

  handleRequest = jest.fn((req, res, next) => {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
  });

  getName = jest.fn(() => _name);

  return { handleRequest, getName };
};

module.exports = MockSSEHandler;
//===========================================================================
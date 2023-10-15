//===========================================================================
//  
//===========================================================================
const stream = require('../../../src/modules/sysinfo/stream');
const DataSampler = require('../../../src/modules/event_manager/data_sampler');

const EXPECTED_SYSTIME_SAMPLER_PERIOD = 1000;
const EXPECTED_RESOURCE_SAMPLER_PERIOD = 10000;
const EXPECTED_SYSTIME_GET_ALL_RETVAL = 'This is a systime.getAll() return value';
const EXPECTED_SYSINFO_HDD_RETVAL = 'This is a sysinfo.hdd() return value';
const EXPECTED_SYSINFO_CPU_RETVAL = 'This is a sysinfo.cpu() return value';
const EXPECTED_SYSINFO_NETWORK_RETVAL = 'This is a sysinfo.network() return value';
const EXPECTED_SYSINFO_MEMORY_RETVAL = 'This is a sysinfo.memory() return value';

const EXPECTED_SYSINFO_SAMPLE = {
  cpu_info: EXPECTED_SYSINFO_CPU_RETVAL,
  hdd_info: EXPECTED_SYSINFO_HDD_RETVAL,
  mem_info: EXPECTED_SYSINFO_MEMORY_RETVAL,
  netstats: EXPECTED_SYSINFO_NETWORK_RETVAL,
}

const SYSINFO_MOCK = {
  hdd: jest.fn(async () => EXPECTED_SYSINFO_HDD_RETVAL),
  cpu: jest.fn(async () => EXPECTED_SYSINFO_CPU_RETVAL),
  network: jest.fn(async () => EXPECTED_SYSINFO_NETWORK_RETVAL),
  memory: jest.fn(() => EXPECTED_SYSINFO_MEMORY_RETVAL),
  cpu_usage: {
    onData: jest.fn(() => null),
  },
  systime: {
    getAll: jest.fn(() => EXPECTED_SYSTIME_GET_ALL_RETVAL),
  },
};

jest.mock('../../../src/modules/event_manager/data_sampler');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('System Information Data Stream Tests', () => {
  it('should initializes sysinfo stream object with callback correctly', () => {

    expect(DataSampler).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);

    const mStream = stream.initialize(SYSINFO_MOCK, () => null);

    /** Verify 2 instances of DataSampler have been created */
    expect(DataSampler).toHaveBeenCalledTimes(2);
    expect(DataSampler.mock.instances.length).toEqual(2);

    /** Verify initialize() returns a start and a stop functions */
    const { start, stop } = mStream;
    expect(typeof start).toEqual('function');
    expect(typeof stop).toEqual('function');

    /** 
     * Verify the callback is registered to the 
     * DataSampler instances' onData()
     */
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(1);
    expect(DataSampler.mock.instances[0].onData).toHaveBeenCalledTimes(1);
    expect(DataSampler.mock.instances[1].onData).toHaveBeenCalledTimes(1);
  });

  it('should initializes sysinfo stream object without callback correctly', () => {
    expect(DataSampler).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);

    const mStream = stream.initialize(SYSINFO_MOCK, null);

    /** Verify 2 instances of DataSampler have been created */
    expect(DataSampler).toHaveBeenCalledTimes(2);
    expect(DataSampler.mock.instances.length).toEqual(2);

    /** Verify initialize() returns a start and a stop functions */
    const { start, stop } = mStream;
    expect(typeof start).toEqual('function');
    expect(typeof stop).toEqual('function');

    /** 
     * Verify the nothing is registered to the
     * DataSampler instances' onData()
     */
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);
    expect(DataSampler.mock.instances[0].onData).toHaveBeenCalledTimes(0);
    expect(DataSampler.mock.instances[1].onData).toHaveBeenCalledTimes(0);
  });

  it('should start sysinfo stream correctly', () => {
    expect(DataSampler).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);

    const mStream = stream.initialize(SYSINFO_MOCK, () => null);
    const systime_sampler_inst = DataSampler.mock.instances[0];
    const sysinfo_sampler_inst = DataSampler.mock.instances[1];

    /**
     * Verify the internal DataSampler instances'
     * start() and stop() functions have not been invoked.
     */
    expect(systime_sampler_inst.start).toHaveBeenCalledTimes(0);
    expect(sysinfo_sampler_inst.start).toHaveBeenCalledTimes(0);
    expect(systime_sampler_inst.stop).toHaveBeenCalledTimes(0);
    expect(sysinfo_sampler_inst.stop).toHaveBeenCalledTimes(0);

    /** Start the stream */
    mStream.start();

    /**
     * Verify the internal DataSampler instances' start() function 
     * has been invoked but the stop() function hasn't.
     */
    expect(systime_sampler_inst.start).toHaveBeenCalledTimes(1);
    expect(sysinfo_sampler_inst.start).toHaveBeenCalledTimes(1);
    expect(systime_sampler_inst.stop).toHaveBeenCalledTimes(0);
    expect(sysinfo_sampler_inst.stop).toHaveBeenCalledTimes(0);

    /**
     * Verify the args passed in to the internal DataSampler instances'
     * start() function during invocation.
     */
    expect(systime_sampler_inst.start).toHaveBeenCalledWith(EXPECTED_SYSTIME_SAMPLER_PERIOD);
    expect(sysinfo_sampler_inst.start).toHaveBeenCalledWith(EXPECTED_RESOURCE_SAMPLER_PERIOD);
  });

  it('should stop sysinfo stream correctly', () => {
    expect(DataSampler).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);

    const mStream = stream.initialize(SYSINFO_MOCK, () => null);
    const systime_sampler_inst = DataSampler.mock.instances[0];
    const sysinfo_sampler_inst = DataSampler.mock.instances[1];

    /**
     * Verify the internal DataSampler instances'
     * start() and stop() functions have not been invoked.
     */
    expect(systime_sampler_inst.start).toHaveBeenCalledTimes(0);
    expect(sysinfo_sampler_inst.start).toHaveBeenCalledTimes(0);
    expect(systime_sampler_inst.stop).toHaveBeenCalledTimes(0);
    expect(sysinfo_sampler_inst.stop).toHaveBeenCalledTimes(0);

    /** Stop the stream */
    mStream.stop();

    /**
     * Verify the internal DataSampler instances' stop() function 
     * has been invoked but the start() function hasn't.
     */
    expect(systime_sampler_inst.start).toHaveBeenCalledTimes(0);
    expect(sysinfo_sampler_inst.start).toHaveBeenCalledTimes(0);
    expect(systime_sampler_inst.stop).toHaveBeenCalledTimes(1);
    expect(sysinfo_sampler_inst.stop).toHaveBeenCalledTimes(1);
  });

  it('should instantiate the internal DataSamplers correctly', async () => {
    expect(DataSampler).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);

    const mStream = stream.initialize(SYSINFO_MOCK, () => null);

    /** Verify the args passed to the DataSampler constructor are functions */
    const systime_sampler_arg = DataSampler.mock.calls[0][0];
    const sysinfo_sampler_arg = DataSampler.mock.calls[1][0];
    expect(typeof systime_sampler_arg).toEqual('function');
    expect(typeof sysinfo_sampler_arg).toEqual('function');

    expect(SYSINFO_MOCK.systime.getAll).toHaveBeenCalledTimes(0);
    const sampled_systime = systime_sampler_arg();
    expect(SYSINFO_MOCK.systime.getAll).toHaveBeenCalledTimes(1);
    expect(sampled_systime).toEqual(EXPECTED_SYSTIME_GET_ALL_RETVAL);

    expect(SYSINFO_MOCK.hdd).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.memory).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.network).toHaveBeenCalledTimes(0);
    const sampled_sysinfo = await sysinfo_sampler_arg();

    expect(SYSINFO_MOCK.hdd).toHaveBeenCalledTimes(1);
    expect(SYSINFO_MOCK.cpu).toHaveBeenCalledTimes(1);
    expect(SYSINFO_MOCK.memory).toHaveBeenCalledTimes(1);
    expect(SYSINFO_MOCK.network).toHaveBeenCalledTimes(1);
    expect(sampled_sysinfo).toEqual(EXPECTED_SYSINFO_SAMPLE);
  });

  it("should forward data handler callback to the internal DataSamplers instances' onData()", () => {

    const data_handler_cb = jest.fn();
    const mock_data = 'some data';

    expect(DataSampler).toHaveBeenCalledTimes(0);
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(0);

    const mStream = stream.initialize(SYSINFO_MOCK, data_handler_cb);
    const systime_sampler_inst = DataSampler.mock.instances[0];
    const sysinfo_sampler_inst = DataSampler.mock.instances[1];

    /** 
     * Verify the callback is registered to the 
     * DataSampler instances' onData()
     */
    expect(SYSINFO_MOCK.cpu_usage.onData).toHaveBeenCalledTimes(1);
    expect(systime_sampler_inst.onData).toHaveBeenCalledTimes(1);
    expect(sysinfo_sampler_inst.onData).toHaveBeenCalledTimes(1);

    /** Verify the data handler cb has not been invoked */
    expect(data_handler_cb).toHaveBeenCalledTimes(0);
    expect(typeof SYSINFO_MOCK.cpu_usage.onData.mock.calls[0][0]).toEqual('function');
    expect(typeof systime_sampler_inst.onData.mock.calls[0][0]).toEqual('function');
    expect(typeof sysinfo_sampler_inst.onData.mock.calls[0][0]).toEqual('function');

    /** Invoke the handler passed to cpu_usage's onData() */
    SYSINFO_MOCK.cpu_usage.onData.mock.calls[0][0](mock_data);
    expect(data_handler_cb).toHaveBeenCalledTimes(1);
    expect(data_handler_cb).toHaveBeenCalledWith({cpu_usage: mock_data});

    /** Invoke the handler passed to systime sampler's onData() */
    systime_sampler_inst.onData.mock.calls[0][0](mock_data);
    expect(data_handler_cb).toHaveBeenCalledTimes(2);
    expect(data_handler_cb).toHaveBeenCalledWith(mock_data);

    /** Invoke the handler passed to sysinfo sampler's onData() */
    sysinfo_sampler_inst.onData.mock.calls[0][0](mock_data);
    expect(data_handler_cb).toHaveBeenCalledTimes(3);
    expect(data_handler_cb).toHaveBeenCalledWith(mock_data);
  });
});
//===========================================================================
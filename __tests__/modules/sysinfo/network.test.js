//===========================================================================
//  
//===========================================================================
const os = require('os');
const exec_promise = require('../../../src/modules/utils/exec_promise');
const network = require('../../../src/modules/sysinfo/network');

const EXPECTED_WLAN_INTERFACE = 'wlan0';
const EXPECTED_WLAN0_MAC = '12:34:56:aa:bb:cc';
const EXPECTED_WLAN0_IPV4_ADDR = '192.168.1.1';
const EXPECTED_WLAN0_IPV4_NETMASK = '255.255.255.0';
const EXPECTED_WLAN0_IPV4_CIDR = EXPECTED_WLAN0_IPV4_ADDR + '/24';
const EXPECTED_COMMAND = 'ifconfig wlan0';
const EXPECTED_RX_PACKET_CT = '1234';
const EXPECTED_RX_PACKET_BYTES = '199303';
const EXPECTED_RX_ERROR_CT = '1';
const EXPECTED_RX_DROPPED_CT = '2';
const EXPECTED_TX_PACKET_CT = '456';
const EXPECTED_TX_PACKET_BYTES = '60905';
const EXPECTED_TX_ERROR_CT = '3';
const EXPECTED_TX_DROPPED_CT = '4';

const EXPECTED_RESULT = [
  {
    interface: EXPECTED_WLAN_INTERFACE,
    ipaddr: EXPECTED_WLAN0_IPV4_ADDR,
    rx: {
      packets: EXPECTED_RX_PACKET_CT,
      bytes: EXPECTED_RX_PACKET_BYTES,
      error: EXPECTED_RX_ERROR_CT,
      dropped: EXPECTED_RX_DROPPED_CT,
    },
    tx: {
      packets: EXPECTED_TX_PACKET_CT,
      bytes: EXPECTED_TX_PACKET_BYTES,
      error: EXPECTED_TX_ERROR_CT,
      dropped: EXPECTED_TX_DROPPED_CT,
    },
  }
];

jest.mock('os', () => ({
  networkInterfaces: jest.fn(() => ({
    lo: [
      {
        address: '127.0.0.1',
        netmask: '255.0.0.0',
        family: 'IPv4',
        mac: '00:00:00:00:00:00',
        internal: true,
        cidr: '127.0.0.1/8'
      },
    ],
    wlan0: [
      {
        address: `${EXPECTED_WLAN0_IPV4_ADDR}`,
        netmask: EXPECTED_WLAN0_IPV4_NETMASK,
        family: 'IPv4',
        mac: EXPECTED_WLAN0_MAC,
        internal: false,
        cidr: EXPECTED_WLAN0_IPV4_CIDR
      },
    ]
  })),
}));

jest.mock('../../../src/modules/utils/exec_promise', () => jest.fn(async (command) => (
  `${EXPECTED_WLAN_INTERFACE}: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n\
        inet ${EXPECTED_WLAN0_IPV4_ADDR}  netmask ${EXPECTED_WLAN0_IPV4_NETMASK}  broadcast 192.168.1.255\n\
        ether ${EXPECTED_WLAN0_MAC}  txqueuelen 1000  (Ethernet)\n\
        RX packets ${EXPECTED_RX_PACKET_CT}  bytes ${EXPECTED_RX_PACKET_BYTES} (194.6 KiB)\n\
        RX errors ${EXPECTED_RX_ERROR_CT}  dropped ${EXPECTED_RX_DROPPED_CT}  overruns 0  frame 0\n\
        TX packets ${EXPECTED_TX_PACKET_CT}  bytes ${EXPECTED_TX_PACKET_BYTES} (59.4 KiB)\n\
        TX errors ${EXPECTED_TX_ERROR_CT}  dropped ${EXPECTED_TX_DROPPED_CT} overruns 0  carrier 0  collisions 0\n`
)));

afterEach(() => { jest.clearAllMocks() });

describe('Network Information Tests', () => {
  it('should return network information correctly', async () => {
    const result = await network();
    expect(os.networkInterfaces).toHaveBeenCalled();
    expect(exec_promise).toHaveBeenCalledWith(EXPECTED_COMMAND);
    expect(result.length).toEqual(1);
    expect(result).toEqual(EXPECTED_RESULT);
  });
});
//===========================================================================
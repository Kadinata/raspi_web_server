//===========================================================================
//  
//===========================================================================
const hdd = require('../../../src/modules/sysinfo/hdd');
const exec_promise = require('../../../src/modules/utils/exec_promise');

EXPECTED_COMMAND = 'df -T -BM -x tmpfs -x devtmpfs -x rootfs';
EXPECTED_RESULTS = [
  {
    fs: '/dev/root',
    type: 'ext4',
    total: 14674,
    used: 2601,
    avail: 11445,
    percent: 19,
    mount: '/'
  },
  {
    fs: '/dev/mmcblk0p1',
    type: 'vfat',
    total: 253,
    used: 49,
    avail: 204,
    percent: 20,
    mount: '/boot'
  }
]

const COMMAND_OUTPUT = "\
Filesystem     Type 1M-blocks  Used Available Use% Mounted on\n\
/dev/root      ext4    14674M 2601M    11445M  19% /\n\
/dev/mmcblk0p1 vfat      253M   49M      204M  20% /boot\n\
";

jest.mock('../../../src/modules/utils/exec_promise', () => jest.fn(async (command) => COMMAND_OUTPUT));

describe('HDD Information Tests', () => {
  it('should return hdd information correctly', async () => {
    const hdd_info = await hdd();
    expect(exec_promise).toHaveBeenCalledWith(EXPECTED_COMMAND);
    expect(hdd_info instanceof Array).toBe(true);
    expect(hdd_info.length).toBe(2);
    expect(hdd_info).toEqual(EXPECTED_RESULTS);
  });
});

//===========================================================================
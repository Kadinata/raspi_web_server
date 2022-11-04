//===========================================================================
//  
//===========================================================================
const os = require('os');

module.exports = () => {
    const total_mem = os.totalmem();
    const free_mem = os.freemem();
    const percent = free_mem / total_mem;
    return { total_mem, free_mem, percent };
};
//===========================================================================
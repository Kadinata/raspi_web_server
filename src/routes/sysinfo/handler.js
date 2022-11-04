//===========================================================================
//  
//===========================================================================
const { getHandler, validateHandler } = require('../../modules/endpoint_handler/basic_handler');

const validateSysinfo = validateHandler((req) => {
  if (!!req.sysinfo && !!req.sysinfo.sse_handler) return;
  const message = 'GPIO service has not been initialized!';
  throw new Error(message);
});

const os = getHandler((req) => req.sysinfo.os());
const cpu = getHandler((req) => req.sysinfo.cpu());
const memory = getHandler((req) => req.sysinfo.memory());
const netstat = getHandler((req) => req.sysinfo.network());
const storage = getHandler((req) => req.sysinfo.hdd());
const systime = getHandler((req) => req.sysinfo.systime.getAll());
const uptime = getHandler((req) => req.sysinfo.systime.getUptime());
const startTime = getHandler((req) => req.sysinfo.systime.getStartTime());
const localtime = getHandler((req) => req.sysinfo.systime.getLocaltime());
const cpuUsage = getHandler((req) => req.sysinfo.cpu_usage.measurements());
const fetchAll = getHandler((req) => req.sysinfo.fetchAll());
const streamHandler = (req, res, next) => req.sysinfo.sse_handler.handleRequest(req, res, next);

module.exports = {
  os,
  cpu,
  memory,
  netstat,
  storage,
  systime,
  uptime,
  localtime,
  startTime,
  cpuUsage,
  fetchAll,
  streamHandler,
  validateSysinfo,
};

//===========================================================================
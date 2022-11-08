//===========================================================================
//  
//===========================================================================
const express = require('express');
const { getHandler, validateHandler } = require('../../modules/endpoint_handler');
const protectedRoute = require('../../modules/auth/protected_route');

const validateSysinfo = validateHandler((req) => {
  if (!!req.sysinfo && !!req.sysinfo.sse_handler) return;
  const message = 'System Info service has not been initialized!';
  throw new Error(message);
});

const getOsInfo = getHandler((req) => req.sysinfo.os());
const getCpuInfo = getHandler((req) => req.sysinfo.cpu());
const getMemoryInfo = getHandler((req) => req.sysinfo.memory());
const getNetsatInfo = getHandler((req) => req.sysinfo.network());
const getStorageInfo = getHandler((req) => req.sysinfo.hdd());
const getSystimeInfo = getHandler((req) => req.sysinfo.systime.getAll());
const getUptimeInfo = getHandler((req) => req.sysinfo.systime.getUptime());
const getStartTimeInfo = getHandler((req) => req.sysinfo.systime.getStartTime());
const getLocalTimeInfo = getHandler((req) => req.sysinfo.systime.getLocaltime());
const getCpuUsageInfo = getHandler((req) => req.sysinfo.cpu_usage.measurements());
const getAllSystemInfo = getHandler((req) => req.sysinfo.fetchAll());
const streamHandler = (req, res, next) => req.sysinfo.sse_handler.handleRequest(req, res, next);

const router = express.Router();

router.use(protectedRoute, validateSysinfo);
router.get('/', getAllSystemInfo);
router.get('/os', getOsInfo);
router.get('/cpu', getCpuInfo);
router.get('/memory', getMemoryInfo);
router.get('/netstat', getNetsatInfo);
router.get('/storage', getStorageInfo);
router.get('/time', getSystimeInfo);
router.get('/uptime', getUptimeInfo);
router.get('/starttime', getStartTimeInfo);
router.get('/localtime', getLocalTimeInfo);
router.get('/cpu-usage', getCpuUsageInfo);
router.get('/stream', streamHandler);

module.exports = router;
//===========================================================================
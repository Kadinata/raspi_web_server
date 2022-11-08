//===========================================================================
//  
//===========================================================================
const winston = require('winston');

const { format } = winston;
const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return (`${timestamp} [${level}] ${label}: ${message}`);
});

const timestampFormat = {
  format: "MMM/DD/YYYY HH:mm:ss",
};

const logger = winston.createLogger({
  level: process.env.LOGL_EVEL || 'info',
  format: combine(colorize(), timestamp(timestampFormat), customFormat),
  transports: [
    new winston.transports.Console(),
  ],
});

const getLogger = (module_name) => logger.child({ label: `${module_name}` });

module.exports = { getLogger };
//===========================================================================
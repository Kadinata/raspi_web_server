//===========================================================================
//  
//===========================================================================
const exec = require('child_process').exec;

/**
 * Executes a shell command and returns the output as a promise.
 * @param {string} command - Shell command to execute
 * @return - Promise containing the output of the command
 */
module.exports = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      resolve(stdout);
    });
  });
};

//===========================================================================
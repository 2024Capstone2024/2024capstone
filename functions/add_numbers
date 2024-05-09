const { exec } = require('child_process');

exports.handler = async (event, context) => {
  const { num1, num2 } = JSON.parse(event.body);
  const result = await new Promise((resolve, reject) => {
    exec(`python add_numbers.py ${num1} ${num2}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout.trim());
    });
  });

  return {
    statusCode: 200,
    body: result
  };
};

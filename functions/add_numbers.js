// functions/addNumbers.js

const { spawn } = require('child_process');

exports.handler = async (event, context) => {
  const { num1, num2 } = JSON.parse(event.body);

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', ['functions/add_numbers.py', num1.toString(), num2.toString()]);

    let result = '';

    pythonProcess.stdout.on('data', data => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', data => {
      reject(data.toString());
    });

    pythonProcess.on('close', () => {
      resolve({
        statusCode: 200,
        body: result
      });
    });
  });
};

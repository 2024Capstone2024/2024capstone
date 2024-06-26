exports.handler = async function(event, context) {
  const { numbers } = JSON.parse(event.body);
  const sortedNumbers = numbers.sort((a, b) => a - b);
  return {
    statusCode: 200,
    body: JSON.stringify({ sortedNumbers })
  };
};

const AWS = require("aws-sdk");
const stepFunctions = new AWS.StepFunctions();

exports.handler = async (event) => {

  const stateMachineInput = {
    "rawData": event.Records[0].s3.bucket.name,
    "key": event.Records[0].s3.object.key,
    "uploadTime": event.Records[0].eventTime
  }
  // Log the input data that will be sent to the State Machine
  console.log(JSON.stringify(stateMachineInput));

  const params = {
    stateMachineArn: process.env.STATE_MACHINE_ARN,
    input: JSON.stringify(stateMachineInput)
  };

  await stepFunctions.startExecution(params).promise();
};

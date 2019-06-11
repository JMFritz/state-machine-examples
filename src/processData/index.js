// Load AWS SDK and create a new S3 object
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const processedData = process.env.processedData_S3_BUCKET_NAME;

exports.handler = async (event) => {

  var params = {
    Bucket: event.rawData,
    Key: event.key
  };
  const s3getResponse = await s3.getObject(params).promise();

  /*
  Process Raw Data

  Take 1 XLS file and execute scripts that munge (transform and map)
  the data so that all the jobs for a specific employee are
  written to individual csv files.

  Put each individual csv file into the processedData S3 bucket under a specific prefix.
  */

  const files = ["employee_1.csv","employee_2.csv","employee_3.csv","employee_4.csv","employee_5.csv"]
  const prefix = event.key + "_" + event.uploadTime + "/"

  let s3Promises = [];

  files.forEach((file) => {
    const testObject = "Sample Data within, " + file
    const params = {
      Bucket: processedData,
      Body: testObject,
      Key: prefix + file
    };
    const s3Promise = s3.putObject(params).promise();
    s3Promises.push(s3Promise);
  });
  await Promise.all(s3Promises);

  /*
  Add additional information to the event trigger that
  this function receives and sends back upon completion.
  This technique is one of the key concepts in event driven
  architectures wherein various microservices send messages
  to other services that are configured to recieve them via
  subscriptions, queues, topics, etc.
  */

  event.processedData = processedData;
  event.prefix = prefix;
  event.completedTask = "processData";
  console.log(JSON.stringify(event));

  return event;
  // function CustomError(task) {
  //   this.name = 'CustomError';
  //   this.message = 'Process failed on task: ' + task;
  // }
  // CustomError.prototype = new Error();

  // const error = new CustomError(event.currentTask);
  // throw error;
};

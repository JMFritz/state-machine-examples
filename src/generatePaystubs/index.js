// Load AWS SDK and create a new S3 object
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const paystubs = process.env.paystubs_S3_BUCKET_NAME;

exports.handler = async (event, context) => {

  var params = {
    Bucket: event.processedData, // Alternatively, we could have used the processedData_S3_BUCKET_NAME env var
    Delimiter: '/',
    Prefix: event.prefix
  };
  const s3listResponse = await s3.listObjects(params).promise();

  /*
  Generate Individual Paystubs and Rollup File

  Retrieve csv files and execute scripts that calculate earnings
  and then write formatted paystub output to a pdf file for each
  employee as well as a single csv file that contains all data
  within each paystub.

  Put individual files into the paystubs S3 bucket under a specific prefix.
  */

  const files = ["rollup.csv","employee_1.pdf","employee_2.pdf","employee_3.pdf","employee_4.pdf","employee_5.pdf"]

  let s3Promises = [];

  files.forEach((file) => {
    const testObject = "Sample Data within, " + file
    const params = {
      Bucket: paystubs,
      Body: testObject,
      Key: event.prefix + file
    };
    const s3Promise = s3.putObject(params).promise();
    s3Promises.push(s3Promise);
  });
  await Promise.all(s3Promises);

  event.paystubs = paystubs;
  event.completedTask = "generatePaystubs";
  console.log(JSON.stringify(event))

  return event;
  // function CustomError(task) {
  //   this.name = 'CustomError';
  //   this.message = 'Process failed on task: ' + task;
  // }
  // CustomError.prototype = new Error();

  // const error = new CustomError(event.completedTask);
  // throw error;
};

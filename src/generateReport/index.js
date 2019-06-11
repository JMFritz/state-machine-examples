// Load AWS SDK and create a new S3 object
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.handler = async (event, context) => {

  var params = {
    Bucket: event.paystubs, // Alternatively, we could have used the paystubs_S3_BUCKET_NAME env var
    Key: event.prefix + "rollup.csv"
  };
  const s3getResponse = await s3.getObject(params).promise();

  /*
  Generate report for the business owner and their CPA who produces
  the payments and submits the direct deposits for each employee.

  They require the report in both pdf and csv format.

  Put each report in the S3 bucket under a specific prefix.
  */

  const files = ["report.pdf", "report.csv"]
  let s3Promises = [];

  files.forEach((file) => {
    const testObject = "Sample Data within, " + file
    const params = {
      Bucket: event.paystubs,
      Body: testObject,
      Key: event.prefix + file
    };
    const s3Promise = s3.putObject(params).promise();
    s3Promises.push(s3Promise);
  });
  await Promise.all(s3Promises);

  event.completedTask = "generateReport";
  console.log(JSON.stringify(event))

  // return event;
  function CustomError(task) {
    this.name = 'CustomError';
    this.message = 'Process failed on task: ' + task;
  }
  CustomError.prototype = new Error();

  const error = new CustomError(event.completedTask);
  throw error;
};

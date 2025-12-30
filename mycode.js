const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { EC2Client, EC2, DescribeInstancesCommand, StartInstancesCommand, StopInstancesCommand } = require('@aws-sdk/client-ec2');

const fs = require('fs');
require('dotenv').config();

const client = new S3Client({ region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const ec2Client = new EC2Client({ region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function startInstance()
{
    await ec2Client.send(new StartInstancesCommand({
        InstanceIds: ['i-0cfb79ec48c519938']
    }))
}

async function stopInstance()
{
    await ec2Client.send(new StopInstancesCommand({
        InstanceIds: ['i-0cfb79ec48c519938']
    }))
}

async function main() {
  const bucket = "s3-bckt-1605"; // name of the bucket

  startInstance();

  // Upload
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: "remote.txt",
    Body: fs.createReadStream("local.txt"),
  }));
  console.log("Uploaded remote.txt");

  // List
  const data = await client.send(new ListObjectsV2Command({ Bucket: bucket }));
  if (data.Contents) {
    data.Contents.forEach(obj => console.log(obj.Key, obj.Size));
  }

  console.log('EC2 Instances');
  const instances = await ec2Client.send(new DescribeInstancesCommand({}));
  console.log(instances.Reservations[0].Instances);

  // stopInstance(); 

  // const body = await client.send(new GetObjectCommand({ Bucket: bucket }));
}

main().catch(console.error);

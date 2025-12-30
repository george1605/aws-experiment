const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require('fs');
require('dotenv').config();

const client = new S3Client({ region: "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function main() {
  const bucket = "s3-bckt-1605"; // name of the bucket

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

  // const body = await client.send(new GetObjectCommand({ Bucket: bucket }));
}

main().catch(console.error);

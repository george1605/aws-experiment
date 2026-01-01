import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

import { Sha256 } from "@aws-crypto/sha256-js";
import { config } from "dotenv";

config();

async function invokeIAMHttpApi() {
  const request = new HttpRequest({
    protocol: "https:",
    hostname: "n4reshidl9.execute-api.eu-north-1.amazonaws.com",
    path: "/default/myLambda", // <- Trigger the Lambda function
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ test: 123 }),
  });

  const signer = new SignatureV4({
    credentials:  {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY   
    }, //defaultProvider(),
    service: "execute-api",
    region: "eu-north-1",
    sha256: Sha256
  });

  const signedRequest = await signer.sign(request);
  console.log(signedRequest)
  const client = new NodeHttpHandler();
  const { response } = await client.handle(signedRequest);
  const body = await new Promise((res, rej) => {
    let data = "";
    response.body.on("data", chunk => data += chunk);
    response.body.on("end", () => res(data));
    response.body.on("error", rej);
  });

  console.log(body);
}

invokeIAMHttpApi().catch(console.error);

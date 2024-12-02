import { CognitoJwtVerifier } from "aws-jwt-verify";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secretId = process.env.secretName;

let response = {
  "isAuthorized": false,
  "context": {
    "userId": "value"
  }
};

let verifier;

async function initializeVerifier() {
  try {
    const client = new SecretsManagerClient({
      region: "ca-central-1",
    });
    const getSecretValueCommand = new GetSecretValueCommand({ SecretId: secretId });
    const secretResponse = await client.send(getSecretValueCommand);

    const credentials = JSON.parse(secretResponse.SecretString);

    verifier = CognitoJwtVerifier.create({
      userPoolId: credentials.userPoolId,
      tokenUse: "id",
      groups: "Admin",
      clientId: credentials.clientId,
    });
  } catch (error) {
    console.error("Error initializing JWT verifier:", error);
    throw new Error("Failed to initialize JWT verifier");
  }
}

export const handler = async (event) => {
  console.log("event", event);

  if (!verifier) {
    await initializeVerifier();
  }

  try {
    let payload = await verifier.verify(event.headers.accesstoken);

    console.log("Token is valid. Payload:", payload);
    response = {
      "isAuthorized": true,
      "context": {
        "userId": payload.sub,
      }
    };
  } catch (e) {
    console.log("Token not valid!");
    throw new Error("Unauthorized");
  }

  return response;
};
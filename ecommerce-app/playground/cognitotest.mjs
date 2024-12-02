import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from 'crypto';

const client = new CognitoIdentityProviderClient({});

function computeSecretHash(clientId, clientSecret, username) {
  return crypto
      .createHmac('sha256', clientSecret) // Use clientSecret as the key
      .update(username + clientId)       // Concatenate username and clientId
      .digest('base64');                 // Encode in base64
}

const clientId = "1kqpsrdup21vkh711qti1dtrj7";
const clientSecret = "1bbios9m5j58ipfhpica5m7vq14r726ttj2ai5sjg00ccd5v49vg";
const username = "Brendan";

const input = {
    "AuthFlow": "USER_PASSWORD_AUTH",
    "AuthParameters": {
      "PASSWORD": "??????",
      "USERNAME": username
    },
    "ClientId": clientId,
    "Region": 'ca-central'
  };

const command = new InitiateAuthCommand(input);
const response = await client.send(command);

console.log('response :>> ', response);



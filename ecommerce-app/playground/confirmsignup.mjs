import {
    CognitoIdentityProviderClient,
    ConfirmSignUpCommand,
  } from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({});

const input = {
    ClientId: "4al0mer01dijpnqmddqr7132hc",
    Username: "yuhei",
    ConfirmationCode: "435810",
}

const command = new ConfirmSignUpCommand(input);

const response = await client.send(command);

console.log('response :>> ', response);

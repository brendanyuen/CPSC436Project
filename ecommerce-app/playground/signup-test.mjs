import {
    CognitoIdentityProviderClient,
    SignUpCommand,
  } from "@aws-sdk/client-cognito-identity-provider";

  const client = new CognitoIdentityProviderClient({});

  const input = {
    ClientId: "4al0mer01dijpnqmddqr7132hc",
    Username: "yuhei",
    UserAttributes: [
        {
            Name: "email",
            Value: "yuhei61627@icloud.com"
        }
    ],
    Password: "123456",
  }

  const command = new SignUpCommand(input);

  const response = await client.send(command);

  console.log('response :>> ', response);


import mysql from 'mysql2/promise';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = process.env.secret_name;

const client = new SecretsManagerClient({
  region: "ca-central-1",
});

async function getSecret(secret_name) {
  try {
    let response = await client.send(
      new GetSecretValueCommand({
        SecretId: secret_name,
      }));

    return JSON.parse(response.SecretString);
  } catch (e) {
    console.error('Error retrieving secret:', e);
    throw e;
  }
}

export const handler = async (event) => {
  let connection;

  try {
    let dbCredentials = await getSecret(secret_name);

    connection = await mysql.createConnection({
      host: 'ecommerce.c7eeeeuega91.ca-central-1.rds.amazonaws.com',
      user: dbCredentials.username,
      password: dbCredentials.password,
      database: 'ecommerce',
    });

    console.log(event.requestContext.authorizer.lambda); 
    const productId = event.queryStringParameters?.productId;
    const userId = event.requestContext.authorizer.lambda.userId;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "No productId in query parameters"
        })
      }
    }

    const query = `INSERT INTO Purchases (userId, product_asin) VALUES (?, ?)`;

    const [response] = await connection.execute(query, [userId, productId]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        response
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: e.message })
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

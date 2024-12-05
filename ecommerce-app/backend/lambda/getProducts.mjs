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
    const page = event.queryStringParameters?.page || "1";
    const limit = event.queryStringParameters?.limit || "10";
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `SELECT * FROM Products LIMIT ? OFFSET ?`;

    const strOffset = offset.toString();
    const [products] = await connection.execute(query, [limit, strOffset]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        products
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

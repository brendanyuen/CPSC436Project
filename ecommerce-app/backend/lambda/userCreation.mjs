import mysql from 'mysql2/promise';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const secret_name = "rds!db-f8407841-d834-4490-a67a-a994b71bc2e1";

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

    let userId = event.request.userAttributes.sub;
    let userName = event.userName;
    let email = event.request.userAttributes.email;

    console.log(event);

    const insertQuery = `
            INSERT INTO Users
            VALUES (?, ?, ?)
        `;

    await connection.execute(insertQuery, [userId, userName, email]);

    console.log(`User ${userName} added to the database.`);
  } catch (e) {
    console.error('Database operation failed:', e);
    throw e;
  } finally {
    if (connection) {
      await connection.end();
    }
  }

  return event;
};

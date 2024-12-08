import mysql from 'mysql2/promise';
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const secret_name = process.env.secret_name;
const client = new SecretsManagerClient({ region: "ca-central-1" });

// Get the secret from AWS Secrets Manager
async function getSecret(secret_name) {
  try {
    let response = await client.send(
      new GetSecretValueCommand({ SecretId: secret_name })
    );
    return JSON.parse(response.SecretString);
  } catch (e) {
    console.error('Error retrieving secret:', e);
    throw e;
  }
}

/**
 * Main Lambda handler
 */
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

    const userId = event.queryStringParameters?.userId;

    const query = `SELECT p.product_asin, p.main_category, p.title, p.description, p.price, p.average_rating, p.image FROM Recommendations r join Products p on r.product_asin = p.product_asin where userId = ?`;

    const [recommendations] = await connection.execute(query, [userId]);

    return {
      statusCode: 200,
      body: JSON.stringify({
        recommendations
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  } catch (error) {
    console.error('Error:', error);
    return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
    };
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

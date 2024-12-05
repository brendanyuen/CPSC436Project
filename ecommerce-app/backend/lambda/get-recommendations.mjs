// import mysql from 'mysql2/promise';
// import {
//   SecretsManagerClient,
//   GetSecretValueCommand,
// } from "@aws-sdk/client-secrets-manager";

// const secret_name = process.env.secret_name;

// const client = new SecretsManagerClient({
//   region: "ca-central-1",
// });

// async function getSecret(secret_name) {
//   try {
//     let response = await client.send(
//       new GetSecretValueCommand({
//         SecretId: secret_name,
//       }));

//     return JSON.parse(response.SecretString);
//   } catch (e) {
//     console.error('Error retrieving secret:', e);
//     throw e;
//   }
// }

// /**
//  * Helper function to calculate Cosine similarity
//  */
// const calculateCosineSimilarity = (ratingsA, ratingsB) => {
//   // Find the common items between ratingsA and ratingsB
//   const commonItems = Object.keys(ratingsA).filter(item => item in ratingsB);

//   // If there are no common items, return 0 (no similarity)
//   if (commonItems.length === 0) return 0;

//   // Calculate the dot product of ratingsA and ratingsB
//   const dotProduct = commonItems.reduce((sum, item) => sum + ratingsA[item] * ratingsB[item], 0);

//   // Calculate the magnitude of ratingsA
//   const magnitudeA = Math.sqrt(commonItems.reduce((sum, item) => sum + Math.pow(ratingsA[item], 2), 0));

//   // Calculate the magnitude of ratingsB
//   const magnitudeB = Math.sqrt(commonItems.reduce((sum, item) => sum + Math.pow(ratingsB[item], 2), 0));

//   // If either vector has a magnitude of zero (i.e., no variance), return 0 similarity
//   if (magnitudeA === 0 || magnitudeB === 0) return 0;

//   // Calculate and return the cosine similarity
//   return dotProduct / (magnitudeA * magnitudeB);
// };



// const getRecommendations = (userId, allRatings) => {
//   // Create a user-item matrix
//   const userRatings = {};
//   allRatings.forEach(({ userId: uId, product_asin, rating }) => {
//       if (!userRatings[uId]) userRatings[uId] = {};
//       userRatings[uId][product_asin] = rating;
//   });

//   // Get target user's ratings
//   const targetRatings = userRatings[userId];
//   if (!targetRatings) {
//       throw new Error(`User ${userId} not found.`);
//   }

//   // Calculate similarity scores with other users
//   const similarityScores = {};
//   Object.keys(userRatings).forEach((otherUserId) => {
//       if (otherUserId !== userId) {
//           const similarity = calculateCosineSimilarity(
//               targetRatings,
//               userRatings[otherUserId]
//           );
//           similarityScores[otherUserId] = similarity;
//       }
//   });

//   // Predict ratings for items the target user has not rated
//   const productScores = {};
//   Object.keys(userRatings).forEach((otherUserId) => {
//       if (similarityScores[otherUserId] > 0) {
//           const otherRatings = userRatings[otherUserId];
//           Object.keys(otherRatings).forEach((product_asin) => {
//               if (!targetRatings[product_asin]) {
//                   if (!productScores[product_asin]) {
//                       productScores[product_asin] = {
//                           total: 0,
//                           weight: 0,
//                       };
//                   }
//                   productScores[product_asin].total += otherRatings[product_asin] * similarityScores[otherUserId];
//                   productScores[product_asin].weight += similarityScores[otherUserId];
//               }
//           });
//       }
//   });

//   // Normalize scores
//   const recommendations = Object.keys(productScores)
//       .map((product_asin) => ({
//           product_asin,
//           score: productScores[product_asin].total / productScores[product_asin].weight,
//       }))
//       .sort((a, b) => b.score - a.score);

//   return recommendations;
// };

// /**
//  * Main Lambda handler
//  */
// export const handler = async (event) => {
//   let connection;

//   try {
//     let dbCredentials = await getSecret(secret_name);

//     connection = await mysql.createConnection({
//       host: 'ecommerce.c7eeeeuega91.ca-central-1.rds.amazonaws.com',
//       user: dbCredentials.username,
//       password: dbCredentials.password,
//       database: 'ecommerce',
//     });

//     const userId = event.queryStringParameters?.userId || "AFTYGYAECGAWJRDXIIXSO3PZ45KA";

//     const query = `SELECT userId, product_asin, rating FROM Reviews`;

//     const [ratings] = await connection.execute(query);

//     let allRatings = ratings

//         // Get recommendations
//         const recommendations = getRecommendations(userId, allRatings);

//         // Return top 5 recommendations
//         return {
//             statusCode: 200,
//             body: JSON.stringify(recommendations.slice(0, 5)),
//         };
//     } catch (error) {
//         console.error('Error:', error);
//         return {
//             statusCode: 500,
//             body: JSON.stringify({ error: error.message }),
//         };
//     }
// };

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

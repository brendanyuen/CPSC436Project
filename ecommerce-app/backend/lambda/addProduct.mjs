import mysql from 'mysql2/promise';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import Busboy from 'busboy';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const secret_name = process.env.secret_name;
const bucket_name = process.env.bucket_name;

const client = new SecretsManagerClient({ region: 'ca-central-1' });
const s3Client = new S3Client({ region: 'ca-central-1' });

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

async function uploadImageToS3(imageBuffer, fileName, mimeType) {
  try {
    const uploadParams = {
      Bucket: bucket_name,
      Key: fileName,
      Body: imageBuffer,
      ContentType: mimeType,
    };
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${bucket_name}.s3.amazonaws.com/${fileName}`;
  } catch (e) {
    console.error('Error uploading image to S3:', e);
    throw e;
  }
}

function parseMultipart(body, boundary) {
  const busboy = Busboy({ headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } });
  const parts = { fields: {}, files: {} };

  return new Promise((resolve, reject) => {
    busboy.on('field', (fieldname, value) => {
      parts.fields[fieldname] = value;
    });

    busboy.on('file', (name, file, info) => {
      const { filename, encoding, mimeType } = info;
      console.log(
        `File [${name}]: filename: %j, encoding: %j, mimeType: %j`,
        filename,
        encoding,
        mimeType
      );
      file.on('data', (data) => {
        console.log(`File [${name}] got ${data.length} bytes`);
        parts.files[name] = {
          filename,
          content: data,
          contentType: mimeType,
        };
      }).on('close', () => {
        console.log(`File [${name}] done`);
      });
    });

    busboy.on('finish', () => resolve(parts));
    busboy.on('error', (err) => reject(err));

    busboy.end(body);
  });
}


export const handler = async (event) => {
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body;

  console.log(body);

  const boundary = event.headers['content-type'].split('boundary=')[1];
  const parts = await parseMultipart(body, boundary);

  console.log(parts);

  let {
    main_category,
    title,
    description,
    price,
  } = parts.fields;

  let imageFile = parts.files.image;

  if (!main_category || !title || !price) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields' }),
    };
  }

  description = description || "";
  imageFile = imageFile || null;

  const productId = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

  if (imageFile) {
    imageFile = await uploadImageToS3(
      imageFile.content,
      productId,
      imageFile.contentType
    );
  }

  let dbCredentials = await getSecret(secret_name);

  const connection = await mysql.createConnection({
    host: 'ecommerce.c7eeeeuega91.ca-central-1.rds.amazonaws.com',
    user: dbCredentials.username,
    password: dbCredentials.password,
    database: 'ecommerce',
  });

  await connection.execute(
    `INSERT INTO Products (product_asin, main_category, title, description, price, image)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [productId, main_category, title, description, price, imageFile]
  );

  const response = {
    statusCode: 201,
    body: JSON.stringify({ message: 'Product added successfully', imageurl: imageFile }),
  };

  return response;
};

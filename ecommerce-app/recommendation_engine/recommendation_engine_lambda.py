#!/usr/bin/env python
# coding: utf-8

# SET UP

import pandas as pd
import numpy as np
from collections import defaultdict

import boto3
from botocore.exceptions import ClientError
import json
import logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

import mysql.connector
from mysql.connector import Error

from pyspark.sql import SparkSession
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.recommendation import ALS

def lambda_handler(event, context):
    try:
        # Parse inputs from the event, if needed
        # Call the main processing function
        main()
        return {
            "statusCode": 200,
            "body": "Recommendations successfully processed and updated."
        }
    except Exception as e:
        logger.exception(f"Error occurred: {str(e)}")
        return {
            "statusCode": 500,
            "body": f"Error: {str(e)}"
        }


def main():

    logger.info("Starting the recommendation engine...")

    #Setting RDS Credentials

    def get_secret():

        secret_name = "rds!db-f8407841-d834-4490-a67a-a994b71bc2e1"
        region_name = "ca-central-1"

        # Create a Secrets Manager client
        session = boto3.session.Session()
        client = session.client(
            service_name='secretsmanager',
            region_name=region_name
        )

        try:
            get_secret_value_response = client.get_secret_value(
                SecretId=secret_name
            )
            return json.loads(get_secret_value_response['SecretString'])
        except ClientError as e:
            raise e

    secret = get_secret()

    host = "ecommerce.c7eeeeuega91.ca-central-1.rds.amazonaws.com"
    user = secret['username']
    password = secret['password']
    port = 3306
    database = "ecommerce"


    #functions to establish and close connection to RDS 

    def connect_to_rds():
        try: #can add a while loop to re-run for failure
            connection = mysql.connector.connect(
                host=host,
                user=user,
                password=password,
                port=port,
                database=database
            )
            if connection.is_connected():
                logger.info("Successfully connected to RDS!")
                cursor = connection.cursor()
                cursor.execute("SELECT DATABASE();")
                record = cursor.fetchone()
                logger.info(f"You're connected to: {record}")
                return connection, cursor
            else:
                return None, None
        except Error as e:
            logger.exception("Error while connecting to RDS:", e)
            return None, None

    def close_connection(connection, cursor):
        if connection!=None and connection.is_connected():
            cursor.close()
            connection.close()
            logger.info("Connection closed.")

    # Executing queries to get our the reviews table, the purchases table, and all OUR users.

    connection, cursor = connect_to_rds()

    if connection.is_connected() and cursor != None:
        logger.info("Attempting query execution")
        try:       
            get_reviews_query = "SELECT userid, product_asin, rating FROM Reviews;" 
            cursor.execute(get_reviews_query)
            rows = cursor.fetchall()
            columns = [desc[0] for desc in cursor.description] # Fetch column names from the cursor
            
            get_our_users_query = "SELECT userid FROM Users WHERE email IS NOT NULL;"
            cursor.execute(get_our_users_query)
            our_users = cursor.fetchall()

            get_purchases_query = "SELECT DISTINCT userid, product_asin FROM Purchases;"
            cursor.execute(get_purchases_query)
            purchases = cursor.fetchall()

        except Error as e:
            logger.exception("Error while executing MySQL queries:", e)

    # close_connection(connection, cursor)
    # cursor = None
    # connection = None # to avoid dangling pointer


    # print(columns)
    ratings_df = pd.DataFrame(rows, columns=columns)
    ratings_df

    our_users_df = pd.DataFrame(our_users, columns=['userid'])
    logger.info(our_users_df)

    recommendations_dict = {user[0]: list() for user in our_users}
    # print(recommendations_dict)


    purchases_df = pd.DataFrame(purchases, columns=['userid', 'product_asin'])
    # print(purchases_df)

    purchases_dict = defaultdict(list)
    for _, row in purchases_df.iterrows():
        purchases_dict[row['userid']].append(row['product_asin'])

    # print(purchases_dict)

    max_purchases_by_a_user = 0
    for key in purchases_dict.keys():
        n_purchases = len(purchases_dict[key])
        if n_purchases > max_purchases_by_a_user:
            max_purchases_by_a_user = n_purchases
    # print(max_purchases_by_a_user)


    # RUNNING THE COLLABORATIVE FILTERING ML MODEL FROM SPARK - BASED ON ALS


    spark = SparkSession.builder \
        .appName("ALSRecommendationSystem") \
        .getOrCreate()


    num_unique_users = len(np.unique(ratings_df["userid"]))
    num_unique_items = len(np.unique(ratings_df["product_asin"]))

    # Spark's ALS cannot handle the users and items if they're strings - they have to be integers 
    user_mapper = dict(zip(np.unique(ratings_df["userid"]), list(range(num_unique_users))))
    item_mapper = dict(zip(np.unique(ratings_df["product_asin"]), list(range(num_unique_items))))
    user_inverse_mapper = dict(zip(list(range(num_unique_users)), np.unique(ratings_df["userid"])))
    item_inverse_mapper = dict(zip(list(range(num_unique_items)), np.unique(ratings_df["product_asin"])))

    ratings_transformed_df = ratings_df.copy()
    ratings_transformed_df["userid"] = ratings_transformed_df["userid"].map(user_mapper)
    ratings_transformed_df["product_asin"] = ratings_transformed_df["product_asin"].map(item_mapper)
    # print(ratings_transformed_df)
    ratings_spark = spark.createDataFrame(ratings_transformed_df)

    our_users_transformed_df = our_users_df.copy()
    our_users_transformed_df["userid"] = our_users_df["userid"].map(user_mapper)
    # print(our_users_transformed_df)
    # !!! Some users have not rated any items. These users will have NaN in mapped id in the above df. These users cannot get recommendations. 
    our_users_transformed_df = our_users_transformed_df.dropna()
    our_users_spark = spark.createDataFrame(our_users_transformed_df)


    # HYPERPARAMETERS
    num_recommendations_per_user = 5
    num_recommendations_per_user += max_purchases_by_a_user
    training_split_ratio = 0.8

    maxIter=10
    regParam=0.01
    coldStartStrategy="drop"
    implicitPrefs=False 

    metricName="rmse"
    labelCol="rating"
    predictionCol="prediction"


    (training, test) = ratings_spark.randomSplit([training_split_ratio, 1-training_split_ratio])

    # Build the recommendation model using ALS on the training data
    # Note we set cold start strategy to 'drop' to ensure we don't get NaN evaluation metrics
    als = ALS(maxIter=maxIter, regParam=regParam, userCol="userid", itemCol="product_asin", ratingCol="rating", coldStartStrategy=coldStartStrategy, implicitPrefs=implicitPrefs)
    model = als.fit(training)

    # Evaluate the model by computing the RMSE on the test data
    predictions = model.transform(test)
    evaluator = RegressionEvaluator(metricName=metricName, labelCol=labelCol, predictionCol=predictionCol)
    error = evaluator.evaluate(predictions)
    logger.info("Root-mean-square error = " + str(error))
    # consistently getting rmse around 4 which is really bad - the data is EXTREMELY sparse = 0.033%

    # Generate top num_recommendations_per_user product recommendations for OUR users
    userSubsetRecs = model.recommendForUserSubset(our_users_spark.select("userid"), num_recommendations_per_user)


    # Processing the recommendations into desired format

    # user_recommendations_pd = userSubsetRecs.toPandas()
    user_recommendations_pd = pd.DataFrame(userSubsetRecs.collect(), columns=userSubsetRecs.columns)
    # print(user_recommendations_pd)

    user_recommendations_pd['recommended_products'] = user_recommendations_pd['recommendations'].apply(
        lambda recs: [rec[0] for rec in recs]
    )
    user_recommendations_pd = user_recommendations_pd[['userid', 'recommended_products']]

    user_recommendations_pd["userid"] = user_recommendations_pd["userid"].map(user_inverse_mapper)
    user_recommendations_pd['recommended_products'] = user_recommendations_pd['recommended_products'].apply(
        lambda rec_products: [item_inverse_mapper[product] for product in rec_products]
    )

    user_recommendations_pd.head(10)

    for index, row in user_recommendations_pd.iterrows():
        recommendations_dict[row['userid']]=row['recommended_products']

    # print(recommendations_dict)


    # We don't want to recommend products that have already been bought
    for user in recommendations_dict.keys():
        if user in purchases_dict:
            recommendations_dict[user] = [product for product in recommendations_dict[user] if product not in purchases_dict[user]]
            # recommendations_dict[key] - purchases_dict[key]  # Subtract corresponding sets !!!

    num_recommendations_per_user -= max_purchases_by_a_user
    for user in recommendations_dict.keys():
        recommendations_dict[user] = recommendations_dict[user][:num_recommendations_per_user]

    # print(recommendations_dict)


    # UPDATING THE RECOMMENDATIONS ON RDS


    # connection, cursor = connect_to_rds()
    if connection.is_connected() and cursor != None:
        logger.info("Attempting query execution")
        try:       
            delete_existing_recommendations_query = "DELETE FROM Recommendations;" #can also use TRUNCATE TABLE recommendations;
            cursor.execute(delete_existing_recommendations_query)
            connection.commit()
            # _ = cursor.fetchall()
        
        except Error as e:
            logger.exception("Error while executing MySQL queries:", e)


    if connection.is_connected() and cursor != None:
        logger.info("Attempting query execution")
        try:       
            for user in recommendations_dict:
                for recommendation in recommendations_dict[user]:
                    insertion_query = f"INSERT INTO Recommendations (userid, product_asin) VALUES ('{user}', '{recommendation}');"
                    print(insertion_query)
                    cursor.execute(insertion_query)
                    connection.commit()
            # _ = cursor.fetchall()
        except Error as e:
            logger.exception("Error while executing MySQL queries:", e)


    close_connection(connection, cursor)
    spark.stop()

# lambda_handler(None, None)
# Populating Products: 1000it [01:02, 15.97it/s] meta_Musical_Instruments.jsonl
# Populating Reviews: 3017439it [1:10:08, 716.90it/s] Musical_Instruments.jsonl
# too slow
import json
import pymysql
from tqdm import tqdm
from dotenv import load_dotenv
import os

load_dotenv()

products_file = '../dataset/meta_Musical_Instruments.jsonl'
reviews_file = '../dataset/Musical_Instruments.jsonl'

# no .env file with correct configuration, no run
db_config = {
    'host': os.getenv('host'),
    'user': os.getenv('user'),
    'password': os.getenv('password'),
    'database': os.getenv('database'),
    'charset': os.getenv('charset')
}

connection = pymysql.connect(**db_config)
cursor = connection.cursor()

def populate_products():
    selected_products = set()
    
    with open(products_file, "r") as file:
        for line in tqdm(file, desc="Populating Products"): # just for progress visualizaiton
            if len(selected_products) >= 1000:
                break
            product = json.loads(line)
            product_asin = product.get('parent_asin')

            if product_asin in selected_products:
                continue
            selected_products.add(product_asin)

            main_category = product.get('main_category')
            title = product.get('title')
            description = ' '.join(product.get('description', []))
            price = product.get('price')
            average_rating = product.get('average_rating')
            image = product.get('images', [{}])[0].get('large')

            cursor.execute("""
                INSERT IGNORE INTO Products (product_asin, main_category, title, description, price, average_rating, image)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (product_asin, main_category, title, description, price, average_rating, image))

    connection.commit()
    return selected_products

def populate_reviews(selected_products):
    with open(reviews_file, "r") as file:
        for line in tqdm(file, desc="Populating Reviews"):
            review = json.loads(line)
            userId = review.get('user_id')
            product_asin = review.get('parent_asin')

            if product_asin not in selected_products:
                continue

            rating = review.get('rating')

            cursor.execute("""
                INSERT IGNORE INTO Users (userId)
                VALUES (%s)
            """, (userId,))

            cursor.execute("""
                INSERT INTO Reviews (userId, product_asin, rating)
                VALUES (%s, %s, %s)
            """, (userId, product_asin, rating))

    connection.commit()

try:
    selected_products = populate_products()  # Select and insert 1000 products
    populate_reviews(selected_products)  # Insert reviews for the selected products
    print("Data successfully populated.")
except Exception as e:
    print(f"An error occurred: {e}")
finally:
    cursor.close()
    connection.close()
import json
import pymysql
from tqdm import tqdm
import multiprocessing
from dotenv import load_dotenv
import os

load_dotenv()

products_file = '../dataset/meta_Appliances.jsonl'
reviews_file = '../dataset/Appliances.jsonl'

# no .env file with correct configuration, no run
db_config = {
    'host': os.getenv('host'),
    'user': os.getenv('user'),
    'password': os.getenv('password'),
    'database': os.getenv('database'),
    'charset': os.getenv('charset')
}

def populate_products():
    connection = pymysql.connect(**db_config)
    cursor = connection.cursor()

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
    cursor.close()
    connection.close()

    return selected_products

def insert_reviews_chunk(review_chunk, selected_products_set, connection_params):
    connection = pymysql.connect(**connection_params)
    cursor = connection.cursor()
    
    users_to_insert = set()
    reviews_to_insert = []

    for review in review_chunk:
        user_id = review.get('user_id')
        parent_asin = review.get('parent_asin')
        
        if parent_asin not in selected_products_set:
            continue
        
        rating = review.get('rating')
        users_to_insert.add(user_id)
        reviews_to_insert.append((user_id, parent_asin, rating))

    if users_to_insert:
        cursor.executemany("""
            INSERT IGNORE INTO Users (userId) 
            VALUES (%s)
        """, [(user,) for user in users_to_insert])

    if reviews_to_insert:
        cursor.executemany("""
            INSERT INTO Reviews (userId, product_asin, rating) 
            VALUES (%s, %s, %s)
        """, reviews_to_insert)

    connection.commit()
    cursor.close()
    connection.close()

def distribute_reviews(selected_products_set, connection_params, num_processes=4):
    with open(reviews_file, 'r') as file:
        reviews = [json.loads(line) for line in file]

    chunk_size = len(reviews) // num_processes
    chunks = [reviews[i:i + chunk_size] for i in range(0, len(reviews), chunk_size)]
    chunks = chunks[:num_processes]
    
    with multiprocessing.Pool(processes=num_processes) as pool:
        pool.starmap(insert_reviews_chunk, [(chunk, selected_products_set, connection_params) for chunk in chunks])

if __name__ == "__main__":
    selected_products = populate_products()  # Select and insert 1000 products
    distribute_reviews(selected_products, db_config, num_processes=4)  # Insert reviews for the selected products
    print("Data successfully populated.")
import psycopg2
from psycopg2 import sql

try:
    conn = psycopg2.connect(
        dbname="db_project",
        user="db_project",
        password="123456",
        host="localhost",
        port="5432"
    )
    conn.autocommit = True
    cur = conn.cursor()
    
    print("Successfully connected to database.")
    
    try:
        cur.execute("CREATE TABLE IF NOT EXISTS test_verification (id serial PRIMARY KEY);")
        print("Successfully created table.")
        cur.execute("DROP TABLE test_verification;")
        print("Successfully dropped table.")
    except Exception as e:
        print(f"Error creating/dropping table: {e}")
        
    cur.close()
    conn.close()

except Exception as e:
    print(f"Connection failed: {e}")

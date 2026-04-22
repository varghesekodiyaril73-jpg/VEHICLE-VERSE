import psycopg2

try:
    conn = psycopg2.connect(
        dbname="db_project",
        user="db_project",
        password="123456",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()
    
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    
    tables = cur.fetchall()
    print("--- List of Tables in 'public' schema ---")
    for table in tables:
        print(table[0])
        
    cur.close()
    conn.close()

except Exception as e:
    print(f"Error: {e}")

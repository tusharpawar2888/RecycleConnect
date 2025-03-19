import sqlite3
from datetime import datetime

def print_table_separator():
    print("-" * 100)

# Connect to the database
conn = sqlite3.connect('instance/users.db')
cursor = conn.cursor()

# Get list of tables
print("\n📋 Tables in the database:")
print_table_separator()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()
for table in tables:
    print(f"📁 {table[0]}")

# Get table schema
print("\n📊 Table Schema:")
print_table_separator()
for table in tables:
    cursor.execute(f"PRAGMA table_info({table[0]})")
    columns = cursor.fetchall()
    print(f"\n📝 Table: {table[0]}")
    print("Column Name".ljust(20) + "Type".ljust(15) + "Nullable".ljust(10) + "Default".ljust(15) + "Primary Key")
    print_table_separator()
    for col in columns:
        name, type_, nullable, default, pk = col[1], col[2], "Yes" if col[3] == 0 else "No", col[4] or "None", "Yes" if col[5] == 1 else "No"
        print(f"{name.ljust(20)}{type_.ljust(15)}{nullable.ljust(10)}{str(default).ljust(15)}{pk}")

# Get contents of user table
print("\n👥 Users in the database:")
print_table_separator()
try:
    cursor.execute("SELECT * FROM user")
    users = cursor.fetchall()
    if users:
        # Print header
        cursor.execute("PRAGMA table_info(user)")
        columns = [col[1] for col in cursor.fetchall()]
        print("".join(col.ljust(30) for col in columns))
        print_table_separator()
        
        # Print data
        for user in users:
            print("".join(str(value).ljust(30) for value in user))
    else:
        print("No users found in the database")
except sqlite3.OperationalError as e:
    print(f"Error: {e}")

# Get some statistics
print("\n📈 Database Statistics:")
print_table_separator()
try:
    cursor.execute("SELECT COUNT(*) FROM user")
    user_count = cursor.fetchone()[0]
    print(f"Total users: {user_count}")
    
    if user_count > 0:
        cursor.execute("SELECT MIN(created_at), MAX(created_at) FROM user")
        min_date, max_date = cursor.fetchone()
        print(f"First user created: {min_date}")
        print(f"Latest user created: {max_date}")
except sqlite3.OperationalError as e:
    print(f"Error: {e}")

conn.close()
print("\n✅ Database connection closed") 
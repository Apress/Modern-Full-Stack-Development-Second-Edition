import random
import sqlite3
import time

def getRandomID():
    return round((time.time() * 1000) + random.randrange(10, 100000, 1))

conn = sqlite3.connect("C:\\temp\\test.db")
conn.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        age INTEGER
    );
""")
sql = "INSERT INTO users (id, name, age) VALUES (?, ?, ?)"
data = [
    (getRandomID(), "Alice", 21),
    (getRandomID(), "Bob", 22),
    (getRandomID(), "Chris", 23)
]
conn.executemany(sql, data)
data = conn.execute("SELECT * FROM users WHERE age <= 22")
for row in data:
    print(row)

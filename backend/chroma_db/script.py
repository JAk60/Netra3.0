import chromadb

client = chromadb.PersistentClient(
    path="/home/cdtis/IITB/Netra3.0/backend/chroma_db"
)

print("Before:", [c.name for c in client.list_collections()])

client.delete_collection("sql_patterns")

print("After:", [c.name for c in client.list_collections()])
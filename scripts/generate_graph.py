import os
import re
import json
import glob

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
CONTENT_DIR = os.path.join(PROJECT_ROOT, "content")
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "static", "graph.json")

def parse_front_matter(text):
    match = re.match(r"^\+\+\+\n(.*?)\n\+\+\+", text, re.DOTALL)
    if not match:
        return {}
    fm = match.group(1)
    data = {}
    title_match = re.search(r'title\s*=\s*"([^"]*)"', fm)
    if title_match:
        data["title"] = title_match.group(1)
    return data

nodes = []
links = []

# static top-level nodes
nodes.append({"id": "home", "title": "home", "url": "/", "type": "source"})
nodes.append({"id": "about", "title": "about", "url": "/about/", "type": "target"})
nodes.append({"id": "posts", "title": "posts", "url": "/blog/", "type": "source"})
nodes.append({"id": "photos", "title": "photos", "url": "/photo/", "type": "target"})
nodes.append({"id": "books", "title": "books", "url": "/books/", "type": "target"})
nodes.append({"id": "library", "title": "library", "url": "/library/", "type": "target"})

links.append({"source": "home", "target": "about"})
links.append({"source": "home", "target": "posts"})
links.append({"source": "home", "target": "photos"})
links.append({"source": "home", "target": "books"})
links.append({"source": "books", "target": "library"})

for filepath in glob.glob(f"{CONTENT_DIR}/blog/*.md"):
    filename = os.path.basename(filepath)
    if filename == "_index.md":
        continue
    slug = filename.replace(".md", "")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    fm = parse_front_matter(text)
    title = fm.get("title", slug)

    nodes.append({
        "id": title,
        "title": title,
        "url": f"/blog/{slug}/",
        "type": "target"
    })

    links.append({"source": "posts", "target": title})

graph = {"nodes": nodes, "links": links}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2)

print(f"Generated {OUTPUT_FILE} with {len(nodes)} nodes and {len(links)} links")

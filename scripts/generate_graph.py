import os
import re
import json
import glob

CONTENT_DIR = "content"
OUTPUT_FILE = "static/graph.json"

def parse_front_matter(text):
    match = re.match(r"^\+\+\+\n(.*?)\n\+\+\+", text, re.DOTALL)
    if not match:
        return {}
    fm = match.group(1)
    data = {}
    title_match = re.search(r'title\s*=\s*"([^"]*)"', fm)
    if title_match:
        data["title"] = title_match.group(1)
    tags_match = re.search(r"tags\s*=\s*\[(.*?)\]", fm, re.DOTALL)
    if tags_match:
        data["tags"] = [t.strip().strip('"') for t in tags_match.group(1).split(",") if t.strip()]
    return data

nodes = []
links = []
tag_nodes = set()

# static top-level nodes
nodes.append({"id": "home", "title": "home", "url": "/", "type": "source"})
nodes.append({"id": "about", "title": "about", "url": "/about/", "type": "target"})
nodes.append({"id": "posts", "title": "posts", "url": "/blog/", "type": "source"})
nodes.append({"id": "photos", "title": "photos", "url": "/photo/", "type": "target"})

links.append({"source": "home", "target": "about"})
links.append({"source": "home", "target": "posts"})
links.append({"source": "home", "target": "photos"})

for filepath in glob.glob(f"{CONTENT_DIR}/blog/*.md"):
    filename = os.path.basename(filepath)
    if filename == "_index.md":
        continue
    slug = filename.replace(".md", "")
    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()
    fm = parse_front_matter(text)
    title = fm.get("title", slug)
    tags = fm.get("tags", [])

    nodes.append({
        "id": title,
        "title": title,
        "url": f"/blog/{slug}/",
        "type": "target"
    })

    for tag in tags:
        if tag not in tag_nodes:
            nodes.append({
                "id": tag,
                "title": tag,
                "url": f"/tags/{tag}/",
                "type": "source"
            })
            tag_nodes.add(tag)
            links.append({"source": "posts", "target": tag})
        links.append({"source": tag, "target": title})

graph = {"nodes": nodes, "links": links}

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(graph, f, indent=2)

print(f"Generated {OUTPUT_FILE} with {len(nodes)} nodes and {len(links)} links")

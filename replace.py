import re

# 1. Read the current index.html file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 2. Read the new cards from cards.html
with open('cards.html', 'r', encoding='utf-8') as f:
    cards_html = f.read().rstrip()

# 3. Match from <div class="carousel-track"> up to its closing </div> before the "See All" button container
pattern = re.compile(
    r'(<div class="carousel-track">\s*\n).*?(\n\s*</div>\s*\n\s*<div class="mt-16 text-center">)',
    re.DOTALL
)

# 4. Safely replace the old cards with cards_html
if pattern.search(content):
    new_content = pattern.sub(lambda m: f"{m.group(1)}{cards_html}{m.group(2)}", content)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Carousel cards in index.html have been updated!")
else:
    print("Error: Could not find the .carousel-track section in index.html.")

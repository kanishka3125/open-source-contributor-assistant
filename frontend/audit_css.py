import os
import re
import glob

with open('frontend/src/index.css', 'r', encoding='utf-8') as f:
    css_content = f.read()

for jsx in glob.glob('frontend/src/components/*.jsx'):
    with open(jsx, 'r', encoding='utf-8') as f:
        content = f.read()
    classes = re.findall(r'className=["\']([^"\']+)["\']', content)
    missing = set()
    for c_str in classes:
        for c in c_str.split():
            if '$' in c or '{' in c:
                continue
            if f'.{c}' not in css_content:
                missing.add(c)
    if missing:
        print(f"{os.path.basename(jsx)}: missing {missing}")

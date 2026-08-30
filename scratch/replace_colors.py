import os
import re

CSS_VARS = {
    r"'#fff'": "var(--text-main)",
    r"'#ffffff'": "var(--text-main)",
    r"'white'": "var(--text-main)",
    r"'#000'": "var(--bg-color)",
    r"'#000000'": "var(--bg-color)",
    r"'black'": "var(--bg-color)",
    r"'rgba\(255,\s*255,\s*255,\s*0.05\)'": "var(--overlay-light)",
    r"'rgba\(255,255,255,0.05\)'": "var(--overlay-light)",
    r"'rgba\(255,\s*255,\s*255,\s*0.1\)'": "var(--overlay-medium)",
    r"'rgba\(255,255,255,0.1\)'": "var(--overlay-medium)",
    r"'rgba\(255,\s*255,\s*255,\s*0.15\)'": "var(--overlay-medium)",
    r"'rgba\(255,255,255,0.15\)'": "var(--overlay-medium)",
    r"'rgba\(255,\s*255,\s*255,\s*0.02\)'": "var(--overlay-subtle)",
    r"'rgba\(255,255,255,0.02\)'": "var(--overlay-subtle)",
    r"'rgba\(255,\s*255,\s*255,\s*0.03\)'": "var(--overlay-subtle)",
    r"'rgba\(255,255,255,0.03\)'": "var(--overlay-subtle)",
    r"'rgba\(255,\s*255,\s*255,\s*0.08\)'": "var(--overlay-hover)",
    r"'rgba\(255,255,255,0.08\)'": "var(--overlay-hover)",
    r"'rgba\(0,\s*0,\s*0,\s*0.2\)'": "var(--shadow-color)",
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    for pattern, replacement in CSS_VARS.items():
        # Ensure we wrap the var replacement in quotes because it's replacing quoted strings in JS/TS
        content = re.sub(pattern, f"'{replacement}'", content)
        
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/web/src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

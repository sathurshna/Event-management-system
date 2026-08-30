import os
import re

JS_VARS = {
    # We replace string literal patterns with actual code references.
    r"'rgba\(255,\s*255,\s*255,\s*0.05\)'": "colors.overlayLight",
    r"'rgba\(255,255,255,0.05\)'": "colors.overlayLight",
    r"'rgba\(255,\s*255,\s*255,\s*0.1\)'": "colors.overlayMedium",
    r"'rgba\(255,255,255,0.1\)'": "colors.overlayMedium",
    r"'rgba\(255,\s*255,\s*255,\s*0.15\)'": "colors.overlayMedium",
    r"'rgba\(255,255,255,0.15\)'": "colors.overlayMedium",
    r"'rgba\(255,\s*255,\s*255,\s*0.02\)'": "colors.overlaySubtle",
    r"'rgba\(255,255,255,0.02\)'": "colors.overlaySubtle",
    r"'rgba\(255,\s*255,\s*255,\s*0.03\)'": "colors.overlaySubtle",
    r"'rgba\(255,255,255,0.03\)'": "colors.overlaySubtle",
    r"'rgba\(255,\s*255,\s*255,\s*0.08\)'": "colors.overlayHover",
    r"'rgba\(255,255,255,0.08\)'": "colors.overlayHover",
    r"'rgba\(0,\s*0,\s*0,\s*0.2\)'": "colors.overlayMedium",
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    orig = content
    for pattern, replacement in JS_VARS.items():
        content = re.sub(pattern, replacement, content)
        
    # Extra fix for explicit black/white where it's a known non-button Text color issue
    # content = re.sub(r"color: 'white'", "color: colors.textMain", content)
    # Actually, many whites are in buttons (like <ActivityIndicator color="white"/>). 
    # Let's manually review 'white' below using standard manual patches if needed.
        
    if orig != content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk('frontend/mobile'):
    for file in files:
        if file.endswith(('.tsx', '.ts')) and "theme.ts" not in file:
            process_file(os.path.join(root, file))

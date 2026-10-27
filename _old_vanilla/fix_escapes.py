import os

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace literal \${ with ${
    if r'\${' in content:
        new_content = content.replace(r'\${', '${')
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

for root, dirs, files in os.walk('js'):
    for file in files:
        if file.endswith('.js'):
            fix_file(os.path.join(root, file))

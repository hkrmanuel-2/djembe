
import os

path = r"c:\Users\bryan\OneDrive\Documents\djembe\src\components\Worlds\World1.tsx"

try:
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    print(f"Total lines: {len(lines)}")
    
    # Validation
    # Line 81 (index 80) should start with '  useEffect'
    line81 = lines[80]
    print(f"Line 81 content: {line81.strip()}")
    
    # Line 144 (index 143) should start with '    useEffect'
    line144 = lines[143]
    print(f"Line 144 content: {line144.strip()}")
    
    if "useEffect" not in line81:
         print("Validation FAILED: Line 81 unexpected.")
         exit(1)
         
    if "useEffect" not in line144:
         print("Validation FAILED: Line 144 unexpected.")
         exit(1)

    # Perform cut
    # Keep 0..79
    # Skip 80..142
    # Keep 143..
    
    new_lines = lines[:80] + lines[143:]
    
    with open(path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
        
    print("Successfully removed lines 81-143.")

except Exception as e:
    print(f"Error: {e}")


import re

def check_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    
    # Simple state machine for strings/comments
    in_string = False
    string_char = ''
    in_comment = False 
    
    for line_idx, line in enumerate(lines, 1):
        i = 0
        while i < len(line):
            char = line[i]
            
            # (Same logic for string/comments)
            if not in_string and not in_comment:
                if char == '/' and i + 1 < len(line) and line[i+1] == '/':
                    break 
                if char == '/' and i + 1 < len(line) and line[i+1] == '*':
                    in_comment = True
                    i += 2
                    continue
            
            if in_comment:
                if char == '*' and i + 1 < len(line) and line[i+1] == '/':
                    in_comment = False
                    i += 2
                    continue
                i += 1
                continue

            if in_string:
                if char == '\\':
                    i += 2
                    continue
                if char == string_char:
                    in_string = False
                i += 1
                continue
            
            if char in "\"`'": # simplified check for quote
                 # Wait, ' is used in text... handling ' in JS is tricky if used as apostrophe?
                 # TSX keeps ' for string. But "I'm" in a comment or text node?
                 # Text nodes in JSX are not strings. My parser is too simple for JSX text.
                 # But assume standard JS strings for now.
                 in_string = True
                 string_char = char
                 i += 1
                 continue
            
            if char in '([{':
                stack.append((char, line_idx, i+1))
                # print(f"Push {char} at {line_idx}:{i+1}")
            elif char in ')]}':
                if not stack:
                    print(f"Error: Unexpected '{char}' at line {line_idx}:{i+1}")
                    return
                
                last_char, last_line, last_col = stack.pop()
                expected = {'(': ')', '[': ']', '{': '}'}[last_char]
                if char != expected:
                    print(f"Error: Mismatch '{char}' at line {line_idx}:{i+1}. Expected '{expected}' for '{last_char}' at {last_line}:{last_col}")
                    return
                # print(f"Pop {last_char} at {last_line}:{last_col} with {char} at {line_idx}:{i+1}")
            
            i += 1

    if stack:
        print("Unclosed items at EOF:")
        for item in stack:
             print(f"  '{item[0]}' at {item[1]}:{item[2]}")
    else:
        print("Syntax check passed.")

check_syntax(r'c:\Users\bryan\OneDrive\Documents\djembe\src\components\Worlds\World1.tsx')

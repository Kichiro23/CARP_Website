import re

with open('dist/assets/index-CKZXUP1r.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find API URL
api_matches = re.findall(r'https://carp-backend[^\'"\s]*', content)
print('API URLs found:')
for m in api_matches[:5]:
    print(' ', m)

# Find Google client ID
google_matches = re.findall(r'83677643243-[^\'"\s]*', content)
print('\nGoogle client IDs found:')
for m in google_matches[:5]:
    print(' ', m)

# Check for localhost
local_matches = re.findall(r'localhost:3001[^\'"\s]*', content)
print('\nLocalhost URLs found:')
for m in local_matches[:5]:
    print(' ', m)

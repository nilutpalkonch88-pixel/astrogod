import re
s = open('script.js', encoding='utf-8').read()
h = open('index.html', encoding='utf-8').read()
want = sorted(set(re.findall(r'getElementById\("([^"]+)"\)', s)))
have = set(re.findall(r'id="([^"]+)"', h))
print('JS wants', len(want), 'ids')
missing = [w for w in want if w not in have]
print('MISSING:', missing if missing else 'none - all buttons wired')
print('has renderer:', 'WebGLRenderer' in s)
print('script lines:', s.count('\n') + 1)

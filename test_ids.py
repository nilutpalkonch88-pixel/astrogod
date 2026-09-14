import re
js=open('script.js',encoding='utf-8').read()
html=open('index.html',encoding='utf-8').read()
js_ids=set(re.findall(r'getElementById\(["\'](.*?)["\']\)', js))
html_ids=set(re.findall(r'id=["\'](.*?)["\']', html))
missing=sorted(js_ids-html_ids)
print('JS IDs:', len(js_ids), '| HTML IDs:', len(html_ids))
print('MISSING in HTML:', missing if missing else 'NONE')

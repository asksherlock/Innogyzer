import urllib.request
import urllib.parse
import json
import base64
import os

def get_wikimedia_url(filename):
    url = f"https://en.wikipedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(filename)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            pages = res['query']['pages']
            for page_id in pages:
                if 'imageinfo' in pages[page_id]:
                    return pages[page_id]['imageinfo'][0]['url']
    except:
        pass
    
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles=File:{urllib.parse.quote(filename)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            pages = res['query']['pages']
            for page_id in pages:
                if 'imageinfo' in pages[page_id]:
                    return pages[page_id]['imageinfo'][0]['url']
    except:
        pass
    return None

def download_and_encode(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                content = response.read()
                return "data:image/svg+xml;base64," + base64.b64encode(content).decode('utf-8')
    except:
        pass
    return None

adidas_url = get_wikimedia_url("Adidas_Logo.svg")
adidas_b64 = download_and_encode(adidas_url) if adidas_url else None

if adidas_b64:
    with open("src/App.tsx") as f:
        content = f.read()
    
    content = content.replace("'https://cdn.simpleicons.org/adidas'", f"'{adidas_b64}'")
    
    with open("src/App.tsx", "w") as f:
        f.write(content)
    print("Injected Adidas full logo")
else:
    print("Failed to get Adidas logo")

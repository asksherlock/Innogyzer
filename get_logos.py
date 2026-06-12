import urllib.request
import urllib.parse
import json
import base64

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

bbva_url = get_wikimedia_url("BBVA_2019.svg")
bbva_b64 = download_and_encode(bbva_url) if bbva_url else None

tec_url = get_wikimedia_url("Logo_del_ITESM.svg")
tec_b64 = download_and_encode(tec_url) if tec_url else None

rotoplas_url = get_wikimedia_url("Logo_de_Rotoplas.svg")
rotoplas_b64 = download_and_encode(rotoplas_url) if rotoplas_url else None

with open("bbva_b64.txt", "w") as f:
    f.write(bbva_b64 or "")
with open("tec_b64.txt", "w") as f:
    f.write(tec_b64 or "")
with open("rotoplas_b64.txt", "w") as f:
    f.write(rotoplas_b64 or "")

print("Done generating base64.")

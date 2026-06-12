import os

with open("tec_b64.txt") as f: tec_b64 = f.read().strip()
with open("rotoplas_b64.txt") as f: rotoplas_b64 = f.read().strip()
with open("bbva_b64.txt") as f: bbva_b64 = f.read().strip()

with open("src/App.tsx") as f:
    content = f.read()

content = content.replace("'https://logo.clearbit.com/tec.mx'", f"'{tec_b64}'")
content = content.replace("'https://logo.clearbit.com/rotoplas.com'", f"'{rotoplas_b64}'")
content = content.replace("'https://logo.clearbit.com/bbva.com'", f"'{bbva_b64}'")
content = content.replace("'https://logo.clearbit.com/adidas.com'", "'https://cdn.simpleicons.org/adidas'")

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Injected base64 into App.tsx")

import re

with open("src/App.tsx") as f:
    content = f.read()

# Make Rotoplas white
content = content.replace("{ name: 'Rotoplas', src: 'data:image/svg+xml;base64", "{ name: 'Rotoplas', isWhite: true, src: 'data:image/svg+xml;base64")
# It might already have isWhite: false, let's just do a regex
content = re.sub(r"\{ name: 'Rotoplas'(.*?)isWhite: false", r"{ name: 'Rotoplas'\1isWhite: true", content)

# Change the className in the map
old_class = r"className=\{`h-10 md:h-12 object-contain filter \$\{client.isWhite \? 'brightness-0 invert opacity-70 hover:opacity-100 transition-opacity' : 'opacity-70 hover:opacity-100 transition-opacity'\}`\}"
new_class = r"""className={`object-contain filter ${client.isWhite ? 'brightness-0 invert opacity-70 hover:opacity-100 transition-opacity' : 'opacity-70 hover:opacity-100 transition-opacity'} ${
                  client.name === 'BBVA' ? 'h-6 md:h-8' : 
                  client.name === 'Rotoplas' ? 'h-10 md:h-14' : 
                  client.name === 'Coca-Cola' ? 'h-12 md:h-16' : 
                  client.name === 'Adidas' ? 'h-10 md:h-14' : 
                  'h-14 md:h-16'
                }`}"""

content = re.sub(old_class, new_class, content)

# Add text for Tec de Monterrey
old_img = r"(<img\s+src=\{client\.src\}\s+alt=\{client\.name\}\s+className=\{.*?\}\s+/>)"
new_img = r"""\1
              {client.name === 'Tecnológico de Monterrey' && (
                <span className="text-white font-bold text-xl leading-tight ml-3 opacity-70 group-hover:opacity-100 transition-opacity text-left">
                  Tecnológico<br/>de Monterrey
                </span>
              )}"""

if "Tecnológico<br/>de Monterrey" not in content:
    content = re.sub(old_img, new_img, content)

with open("src/App.tsx", "w") as f:
    f.write(content)

print("Sizes and text fixed!")

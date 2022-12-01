from xml.etree import ElementTree as ET
 
tree = ET.parse('DOI_article_ELIS3.cermxml')
 
for p in tree.findall(".//p"):
    # Get all inner text 
    print("".join(t for t in p.itertext()))

    with open('test2.txt', 'a') as f:
        f.write("".join(t for t in p.itertext()))
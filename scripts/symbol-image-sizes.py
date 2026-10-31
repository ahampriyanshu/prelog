"""Read original image viewports so projected flags have no rectangular letterbox.
Source images are retained byte-for-byte; this writes numeric rendering metadata.
"""
from pathlib import Path
import json,re,struct,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
ratios={}
for path in (root/'public/atlas/symbols').rglob('*.svg'):
    svg=ET.parse(path).getroot()
    box=svg.attrib.get('viewBox','').replace(',',' ').split()
    if len(box)==4:
        width,height=float(box[2]),float(box[3])
    else:
        def number(value):
            match=re.match(r'[\d.]+',value)
            return float(match.group()) if match else 0
        width,height=number(svg.attrib.get('width','')),number(svg.attrib.get('height',''))
    if width>0 and height>0:ratios['/'+str(path.relative_to(root/'public'))]=round(width/height,8)
for path in (root/'public/atlas/symbols').rglob('*'):
    if path.suffix.lower() not in {'.jpg','.jpeg','.png'}:continue
    data=path.read_bytes();width=height=0
    if data.startswith(b'\x89PNG'):
        width,height=struct.unpack('>II',data[16:24])
    elif data.startswith(b'\xff\xd8'):
        offset=2
        while offset+4<len(data):
            if data[offset]!=255:break
            while data[offset]==255:offset+=1
            marker=data[offset];offset+=1
            if marker in [0xd8,0xd9] or 0xd0<=marker<=0xd7:continue
            length=int.from_bytes(data[offset:offset+2],'big')
            if marker in [0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf]:
                height,width=struct.unpack('>HH',data[offset+3:offset+7]);break
            offset+=length
    if width>0 and height>0:ratios['/'+str(path.relative_to(root/'public'))]=round(width/height,8)
    else:raise ValueError('Image dimensions could not be read: '+str(path))
(root/'data/empires/symbol-image-sizes.json').write_text(json.dumps(ratios,indent=2)+'\n')
print(f'Read {len(ratios)} image viewports; no images modified.')

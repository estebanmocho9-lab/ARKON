#!/usr/bin/env python3
import json, re, sys, math, fitz

UNITS=r"(?:mm|cm|m|km|µm|um|nm|kg|g|mg|N|kN|Pa|kPa|MPa|GPa|psi|bar|°C|°F|K|J|kJ|W|kW|V|A|Hz|s|ms|min|h|%|pH|g/cm³|kg/m³|kg/m3|g/cm3|kN/m²|kN/m2)"
VALUE_RE=re.compile(r"[-+]?\d+(?:[.,]\d+)?(?:\s*[×x]\s*10\s*[-^]?\s*\d+)?\s*(?:"+UNITS+r")?",re.I)
STD_RE=re.compile(r"\b(?:ASTM|ISO|EN|DIN|UNE|AASHTO|ACI|ASME|IEEE|IEC|NF|BS|CSA|CEN)\s*[- ]?[A-Z]?\s*\d+[A-Z0-9./-]*\b",re.I)
FORMULA_RE=re.compile(r"\b[A-Za-zΑ-Ωα-ω][A-Za-zΑ-Ωα-ω0-9_]*\s*[=≈≃≤≥<>]\s*[^.;\n]{1,180}")
KEYWORDS={
'MATERIAL':['cemento','cement','concreto','hormigón','hormigon','concrete','acero','steel','madera','wood','aluminio','aluminum','cobre','copper','vidrio','glass','cerámica','ceramic','polímero','polymer','resina','resin','mortero','mortar','arena','sand'],
'COMPONENTE':['componente','component','agregado','aggregate','fibra','fiber','aditivo','additive','matriz','matrix','ligante','binder'],
'PROPIEDAD':['densidad','density','resistencia','strength','rigidez','stiffness','dureza','hardness','porosidad','porosity','permeabilidad','permeability','viscosidad','viscosity','elasticidad','elasticity','conductividad','conductivity','pH'],
'METODO':['método','metodo','method','ensayo','test','medición','medicion','measurement','procedimiento','procedure','calibración','calibration'],
'INSTRUMENTO':['instrumento','instrument','microscopio','microscope','espectrómetro','spectrometer','balanza','balance','sensor','máquina','machine','termómetro','thermometer'],
'APLICACION':['aplicación','aplicacion','application','uso','used','construction','construcción','construccion','puente','bridge','edificio','building'],
'COMPORTAMIENTO':['comportamiento','behavior','behaviour','aumenta','increase','increases','disminuye','decrease','decreases','depende','depends','afecta','affects'],
'CONDICION':['temperatura','temperature','humedad','humidity','presión','pressure','curado','curing','edad','age','ambiente','ambient','bajo','under'],
'RELACION':['compuesto por','composed of','contiene','contains','formado por','formed by','depende de','depends on','relación','relation','proporcional','proportional']}

def norm(s):
 s=s.replace('−','-').replace('–','-').replace('—','-').strip()
 if ',' in s and '.' not in s:s=s.replace(',','.')
 elif ',' in s and '.' in s and s.rfind(',')>s.rfind('.'):s=s.replace('.','').replace(',','.')
 return s

def num(s):
 m=re.search(r'[-+]?\d+(?:[.,]\d+)?',s)
 try:return float(norm(m.group(0))) if m else None
 except:return None

def add(out,kind,field,entity,aspect,data,original,pno,section,bbox,conf,value=None,unit='',context='',source='deterministic'):
 out.append({'kind':kind,'field':field,'entity':entity or original,'aspect':aspect or field,'documentaryData':data or original,'originalText':original,'normalizedText':re.sub(r'\s+',' ',original).strip(),'value':value,'valueText':original,'unit':unit,'symbol':'','context':context or original,'page':pno,'section':section,'confidence':conf,'evidence':{'fragment':original,'page':pno,'section':section,'start':bbox[0],'end':bbox[2]},'metadata':{'source':source,'bbox':bbox}})

def extract(pdf,start,end):
 doc=fitz.open(stream=pdf,filetype='pdf'); findings=[]; pages=[]; current_section=''
 for i in range(start-1,min(end,len(doc))):
  page=doc[i]; words=[]
  for w in page.get_text('words'):
   words.append({'text':w[4],'bbox':[w[0],w[1],w[2],w[3]],'block':w[5],'line':w[6],'word':w[7]})
  text=page.get_text('text')
  blocks=[]
  for b in page.get_text('blocks'):
   if len(b)>=5 and str(b[4]).strip(): blocks.append({'bbox':[b[0],b[1],b[2],b[3]],'text':str(b[4]).strip()})
  heads=[]
  for b in blocks:
   t=b['text']
   if len(t)<=160 and (t.isupper() or re.match(r'^\d+(?:\.\d+)*[.)]?\s+',t)):
    heads.append({'text':t,'bbox':b['bbox']}); current_section=t
  byline={}
  for w in words:byline.setdefault((w['block'],w['line']),[]).append(w)
  for ws in byline.values():
   ws.sort(key=lambda x:x['bbox'][0]); line=' '.join(x['text'] for x in ws).strip()
   if not line:continue
   bbox=[min(x['bbox'][0] for x in ws),min(x['bbox'][1] for x in ws),max(x['bbox'][2] for x in ws),max(x['bbox'][3] for x in ws)]
   low=line.lower()
   for kind,terms in KEYWORDS.items():
    for term in terms:
     pos=low.find(term.lower())
     if pos>=0:
      left=line[:pos].strip(' ,:;()[]{}')
      entity=left[-90:] if left else line[pos:pos+90]
      add(findings,kind,term,entity,term,line,line,i+1,current_section,bbox,.84,context=line,source='keyword_spatial'); break
   for m in STD_RE.finditer(line):add(findings,'NORMA','norma',line[max(0,m.start()-70):m.start()].strip(), 'estandar',m.group(0),m.group(0),i+1,current_section,bbox,.99,context=line,source='standard_regex')
   for m in VALUE_RE.finditer(line):
    raw=m.group(0).strip()
    if not re.search(r'\d',raw):continue
    unit=(re.search(r'('+UNITS+r')\s*$',raw,re.I) or [None,''])[1]
    add(findings,'MAGNITUD','valor',line[max(0,m.start()-90):m.start()].strip() or line[:90],'valor',raw,raw,i+1,current_section,bbox,.97,num(raw),unit,line,'numeric_spatial')
   for m in FORMULA_RE.finditer(line):
    raw=m.group(0).strip()
    add(findings,'FORMULA','formula',line[max(0,m.start()-70):m.start()].strip(),'expresion',raw,raw,i+1,current_section,bbox,.90,context=line,source='formula_regex')
  pages.append({'page':i+1,'text':text,'bbox':[0,0,page.rect.width,page.rect.height],'words':words,'blocks':blocks,'headings':heads,'tables':[],'links':page.get_links(),'images':len(page.get_images(full=True))})
 doc.close()
 seen=set(); clean=[]
 for f in findings:
  k=(f['page'],f['kind'],f['field'],f['entity'],f['originalText'])
  if k not in seen:seen.add(k);clean.append(f)
 return {'pages':pages,'findings':clean}

def main():
 if len(sys.argv)!=3:raise SystemExit('usage: deterministic_stream.py START END')
 pdf=sys.stdin.buffer.read()
 print(json.dumps(extract(pdf,int(sys.argv[1]),int(sys.argv[2])),ensure_ascii=False,separators=(',',':')))

if __name__=='__main__':main()

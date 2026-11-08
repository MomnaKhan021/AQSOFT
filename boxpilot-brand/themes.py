import re
base_keys=["#0B2236","#12324A","#163E5E","#1F4E79","#0E2738","#C8893F","#F2C27E","#E0A458","#D9974A","#B97A35","#FBE3BC","#F5E3C6","#4A6072","#B9CADB","#FBF7F0"]
themes={
 "navy-orange":["#061530","#0B1F45","#10295C","#1B3F8A","#081A3A","#FF7A1A","#FFB067","#FF9440","#F7832A","#D9600B","#FFE2C7","#FFE7D2","#4B5A75","#B8C4DE","#F7F8FB"],
 "teal-amber": ["#062A2E","#0B3B40","#0F4C52","#14706F","#07302F","#F5A623","#FFD27A","#FBBA45","#EFA02E","#C9820F","#FFEBC2","#FFF0D1","#4D6668","#B5D3D2","#F6FAF9"],
 "indigo-coral":["#140F3A","#251C5E","#2F2475","#43349A","#1E1752","#FF6B57","#FFA494","#FF8572","#F2604C","#D24A37","#FFE0DA","#FFE5E0","#59547A","#C4BFE6","#FAF9FD"],
}
for name,vals in themes.items():
    for f in ["logo","banner","logo-transparent"]:
        s=open(f+".html").read()
        for k,v in zip(base_keys,vals): s=re.sub(re.escape(k),v,s,flags=re.I)
        open(f"{f}-{name}.html","w").write(s)

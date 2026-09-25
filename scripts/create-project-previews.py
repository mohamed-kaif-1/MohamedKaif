"""Editable, code-native product interface concepts. All displayed data is illustrative."""
from pathlib import Path
from html import escape
import math

OUT = Path(__file__).resolve().parents[1] / 'dist/assets/images/kaif'

class UI:
    def __init__(self, slug, title, desc, bg, ink, muted, accent, surface, line):
        self.slug, self.ink, self.muted, self.accent, self.surface, self.line = slug, ink, muted, accent, surface, line
        self.a = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900" role="img"><title>{escape(title)} — interface concept</title><desc>{escape(desc)}. Illustrative interface with sample data.</desc>']
        self.rect(0,0,1200,900,bg)
        self.text(48,82,title,58,ink,700)
        self.text(50,126,desc,22,muted)
        self.text(50,866,'INTERFACE CONCEPT  /  SAMPLE DATA',14,muted,600)
        self.text(1148,866,'2026',16,muted,500,anchor='end')
    def rect(self,x,y,w,h,fill=None,r=0,stroke=None):
        self.a.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill or self.surface}"'+(f' stroke="{stroke}"' if stroke else '')+'/>')
    def text(self,x,y,t,size=20,color=None,weight=400,font='Arial, sans-serif',anchor='start'):
        self.a.append(f'<text x="{x}" y="{y}" fill="{color or self.ink}" font-family="{font}" font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">{escape(str(t))}</text>')
    def rule(self,x,y,x2,y2,color=None,width=1):
        self.a.append(f'<path d="M{x} {y}L{x2} {y2}" stroke="{color or self.line}" stroke-width="{width}" fill="none"/>')
    def path(self,d,color=None,width=3,fill='none'):
        self.a.append(f'<path d="{d}" stroke="{color or self.accent}" stroke-width="{width}" fill="{fill}" stroke-linejoin="round" stroke-linecap="round"/>')
    def circle(self,x,y,r,color):
        self.a.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>')
    def pill(self,x,y,w,label,fill=None,color=None):
        self.rect(x,y,w,32,fill or self.accent,16)
        self.text(x+w/2,y+22,label,15,color or '#ffffff',600,anchor='middle')
    def nav(self,label,right='Workspace'):
        self.rect(48,180,1104,632,self.surface,16,self.line)
        self.text(78,221,label,23,weight=700)
        self.text(1118,220,right,16,self.muted,anchor='end')
        self.rule(48,246,1152,246)
    def metric(self,x,y,w,label,value,foot=None):
        self.rect(x,y,w,112,self.surface,10,self.line)
        self.text(x+20,y+30,label,16,self.muted)
        self.text(x+20,y+75,value,35,weight=600)
        if foot:self.text(x+20,y+98,foot,13,self.muted)
    def finish(self):
        self.a.append('</svg>')
        (OUT/f'{self.slug}-product-preview.svg').write_text('\n'.join(self.a))

# SheProof — a verification workspace, focused on a single uploaded document.
u=UI('sheproof','SheProof','Document integrity, verified on-chain.','#f4eee9','#261d20','#827477','#ad3452','#fffdfb','#e6dce0')
u.nav('SP  /  Verification desk','Documents     Activity     Wallet')
u.text(84,294,'Check a document',28,weight=600)
u.text(84,326,'Compare a file against its registered SHA-256 hash.',17,u.muted)
u.rect(84,358,544,196,'#f8f3f3',12,'#dfcbd1')
u.rect(108,384,52,64,'#eadbe0',7)
u.text(134,424,'PDF',14,u.accent,700,anchor='middle')
u.text(178,407,'project-proposal.pdf',23,weight=600)
u.text(178,441,'Selected document  /  248 KB',16,u.muted)
u.pill(108,488,168,'Verify document')
u.text(84,601,'DOCUMENT FINGERPRINT',14,u.muted,700)
u.rect(84,620,544,68,'#f8f3f3',8)
u.text(104,649,'9a83f9c1...b57e204d',22,font='monospace')
u.text(104,672,'SHA-256  /  computed locally',14,u.muted)
u.rect(664,279,452,456,'#1c3931',14)
u.circle(714,334,23,'#a8dfbc');u.path('M703 334 l8 8 17 -19','#1c3931',4)
u.text(698,402,'Integrity confirmed',32,'#edfff4',600)
u.text(698,441,'The document matches its record.',18,'#aed0bd')
for y,label,value in [(500,'Hash comparison','Match'),(558,'On-chain record','Found'),(616,'File changes','None detected')]:
    u.rule(698,y-25,1082,y-25,'#3d5b4d');u.text(698,y,label,16,'#aed0bd');u.text(1082,y,value,18,'#edfff4',600,anchor='end')
u.text(84,771,'Private by design. Verify the fingerprint, keep the file.',16,u.muted)
u.finish()

# Poneglyph — media analysis console with audio timeline and evidence channels.
u=UI('poneglyph','Poneglyph','Image & audio authenticity analysis.','#101724','#f0f5ff','#8b9ab0','#52c9ef','#182234','#2a364a')
u.nav('P / Media analysis','Audio selected  /  Analysis 004')
u.pill(80,272,108,'Audio','#52c9ef','#101724');u.text(218,294,'Image',16,u.muted)
u.text(80,352,'interview_clip.wav',27,weight=600);u.text(80,384,'00:24  /  mono audio  /  analysis preview',16,u.muted)
u.rect(80,416,656,211,'#111a2b',10)
for i in range(90):
    h=13+abs(math.sin(i*.58)*math.cos(i*.16))*130
    u.rule(96+i*7,521-h/2,96+i*7,521+h/2,'#ed8b9e' if 45<i<62 else '#52c9ef',3)
u.text(98,603,'00:00',14,u.muted);u.text(670,603,'00:24',14,u.muted)
u.rule(458,431,458,585,'#ffffff',2)
u.text(80,670,'Evidence timeline',20,weight=600)
u.rect(80,694,656,57,'#22314a',8)
u.text(100,729,'00:12–00:16  /  Inspect synthesis artifacts',18,'#b5dcec')
u.rect(764,272,352,478,'#202e44',12)
u.text(790,317,'ANALYSIS SUMMARY',14,u.muted,700)
u.text(790,367,'Review suggested',27,'#ffc6b9',600)
u.text(790,407,'Model probability',16,u.muted)
u.text(790,462,'78%',56,weight=600)
u.text(790,492,'Synthetic audio estimate',16,u.muted)
for i,(label,v) in enumerate([('Spectral consistency',.71),('Voice continuity',.44),('Temporal artifacts',.84)]):
    y=545+i*60;u.text(790,y,label,16,u.muted);u.rect(790,y+13,292,6,'#34445f',3);u.rect(790,y+13,292*v,6,u.accent,3)
u.text(80,790,'Model estimates support review; they are not a definitive verdict.',15,u.muted)
u.finish()

# CrisisMind — tax analysis, with an exception queue and an explainable signal chart.
u=UI('crisismind','CrisisMind AI','Tax signals. Clearer investigations.','#e7ece6','#1c332b','#6f8277','#287558','#fafcf8','#dce5dc')
u.nav('CM / Tax intelligence','Overview     Signals     Review queue')
u.metric(80,274,322,'Records analyzed','1,284','Illustrative reporting period')
u.metric(438,274,322,'Flagged for review','12','Prioritized signals')
u.metric(796,274,322,'Awaiting review','04','Human assessment required')
u.text(80,437,'Reported vs. expected activity',25,weight=600)
u.text(80,468,'Monthly comparison',16,u.muted)
for k in range(4):u.rule(86,508+k*58,699,508+k*58)
for i,(a,b) in enumerate([(89,97),(111,107),(128,123),(201,133),(143,149),(165,158)]):
    x=113+i*96;u.rect(x,701-a,24,a,'#287558',4);u.rect(x+30,701-b,24,b,'#bacdbd',4)
    u.text(x+26,731,['APR','MAY','JUN','JUL','AUG','SEP'][i],13,u.muted,anchor='middle')
u.pill(381,478,128,'Review spike','#f0caa7','#724218')
u.rect(756,418,362,344,'#eef3eb',12)
u.text(780,459,'Priority signal',23,weight=600)
u.pill(780,481,134,'Needs review','#f0caa7','#724218')
u.text(780,548,'Unusual input-tax claim',21,weight=600)
for y,t in [(582,'A claim differs from the recent'),(607,'pattern. Compare the source'),(632,'invoices before taking action.')]:u.text(780,y,t,17,u.muted)
u.rule(780,663,1093,663);u.text(780,702,'Open evidence',20,u.accent,600)
u.text(80,787,'Analysis → supporting evidence → reviewer decision',15,u.muted)
u.finish()

# Nexus — a simulation command centre, with an abstract sensor-zone data map.
u=UI('nexus','Nexus','Public-safety signals, brought together.','#091f2b','#e6f6fa','#8faab4','#51ddcf','#102e3e','#2a4755')
u.nav('N / Response workspace','SIMULATION  /  Sector 04')
u.text(80,294,'Live signal overview',26,weight=600);u.pill(919,270,197,'Simulation active','#234d54','#8df4df')
u.rect(80,321,680,432,'#0b2533',10)
for i in range(11):u.rule(100+i*61,336,100+i*61,737,'#173947')
for i in range(7):u.rule(96,349+i*61,746,349+i*61,'#173947')
u.path('M96 628 L228 628 L228 539 L384 539 L384 412 L557 412 L557 342','#385d6b',18)
u.path('M180 341 L180 451 L320 451 L320 671 L575 671 L575 738','#254a5a',22)
u.path('M384 539 L532 539 L532 604 L734 604',u.accent,5)
for x,y,name,col in [(228,539,'WATER · 1.8 m','#efac67'),(384,412,'RAIN · 42 mm','#51ddcf'),(532,604,'TRAFFIC · HIGH','#efac67')]:
    u.circle(x,y,15,'#173b48');u.circle(x,y,6,col);u.rect(x-60,y+26,153,30,'#193d4d',5);u.text(x-48,y+47,name,13,col,600)
u.text(107,721,'SCHEMATIC SENSOR ZONES',13,u.muted,600)
u.rect(789,321,326,432,'#173c4a',10)
u.text(812,363,'Response plan',24,weight=600)
u.pill(812,386,150,'Elevated risk','#674828','#ffcf94')
for i,(a,b) in enumerate([('01  Review sensor data','Rainfall + water level'),('02  Assess road access','Check affected routes'),('03  Coordinate response','Human approval required')]):
    y=468+i*94;u.text(812,y,a,18,weight=600);u.text(812,y+30,b,15,u.muted);u.rule(812,y+49,1091,y+49)
u.text(80,789,'Data fusion  /  Policy rules  /  Coordinated escalation',15,u.muted)
u.finish()

# AuthForge — governed requests and structured output in a two-pane workbench.
u=UI('authforge','AuthForge','Turn a request into a governed action.','#e8e3f3','#2d2440','#82758f','#7954c2','#fffefe','#e2dbea')
u.nav('AF / Request workbench','Requests     Policies     Audit trail')
u.text(82,294,'Your request',24,weight=600)
u.rect(80,319,499,153,'#f6f3fb',10,'#e1d6f0')
for y,t in [(356,'Summarize this month’s invoices'),(386,'and flag overdue payments.'),(442,'Natural language input')]:u.text(102,y,t,21 if y<400 else 14,u.ink if y<400 else u.muted)
u.text(82,522,'Policy checks',23,weight=600)
for i,(a,b) in enumerate([('Access scope','Invoices: read only'),('Data boundaries','Approved workspace'),('Action control','Review before execution')]):
    y=566+i*64;u.circle(96,y-6,8,'#d4c5ef');u.text(116,y,a,18,weight=600);u.text(116,y+25,b,15,u.muted)
u.pill(81,745,192,'Validate request')
u.rect(617,276,501,500,'#282136',12)
u.text(644,317,'Structured output',24,'#f6efff',600);u.pill(924,294,166,'Policy checked','#47385e','#dccbfa')
code=[('{','#ddd0f2'),('  "intent": "invoice_summary",','#c5b0ef'),('  "scope": "current_month",','#c5b0ef'),('  "include": [','#c5b0ef'),('    "overdue_payments"','#a1dabf'),('  ],','#c5b0ef'),('  "permissions": "read_only",','#c5b0ef'),('  "approval": "required"','#eac591'),('}','#ddd0f2')]
for i,(t,c) in enumerate(code):u.text(645,379+i*34,t,18,c,font='monospace')
u.rule(644,701,1090,701,'#47385e');u.text(644,739,'Ready for human review',18,'#d8c7f5')
u.finish()

# Code Garden — an actual learning-workspace composition, no decorative plant artwork.
u=UI('codegarden','Code Garden','Write Java. Solve challenges. Grow your skills.','#eaf1c6','#273c23','#748365','#547e36','#fcfff1','#dbe5c3')
u.nav('CG / Learning studio','JDK 21     JavaFX     JShell')
u.rect(69,264,229,526,'#f0f5db',10)
u.text(90,306,'JAVA PATH',15,u.muted,700)
for i,(a,b) in enumerate([('01  Variables','Complete'),('02  Conditions','Complete'),('03  Loops','In progress'),('04  Methods','Up next')]):
    y=351+i*88
    if i==2:u.rect(80,y-30,207,76,'#d9e8b0',8)
    u.text(96,y,a,19,weight=600);u.text(96,y+25,b,14,u.muted)
u.text(94,737,'240 coins',26,u.accent,700);u.text(94,766,'Earned through practice',13,u.muted)
u.text(325,303,'Challenge 03: Sum an array',25,weight=600)
u.text(325,337,'Use a loop to add each value to the total.',17,u.muted)
u.rect(323,364,795,286,'#213426',10)
code=['int[] values = {2, 4, 6, 8};','int total = 0;','','for (int value : values) {','    total += value;','}','System.out.println(total);']
for i,t in enumerate(code):
    u.text(344,405+i*32,str(i+1),16,'#778f7c',font='monospace');u.text(382,405+i*32,t,21,'#cce8ac' if i in [0,1,3] else '#f0f5e9',font='monospace')
u.rect(323,668,795,112,'#e5f0ce',10)
u.text(345,702,'JSHELL OUTPUT',14,u.muted,700);u.text(345,750,'20',32,u.ink,700)
u.pill(852,703,235,'Challenge complete','#527c39','#ffffff')
u.finish()

# Chrissoft — the core billing and ERP product, with an integrated BI answer.
u=UI('chrissoft','Chrissoft AI','Everyday ERP. Business insights built in.','#e5ecf5','#162c4c','#7686a0','#366ee0','#ffffff','#dce5f0')
u.nav('chrissoft / Business workspace','Sales     Inventory     Reports')
u.metric(79,270,320,'Sales this month','₹ 2,84,500','Sample business')
u.metric(438,270,320,'Outstanding invoices','₹ 42,800','6 invoices awaiting payment')
u.metric(797,270,320,'Items to reorder','08','Based on sample inventory')
u.text(80,433,'Recent invoices',25,weight=600);u.pill(518,407,180,'+ Create invoice')
u.rect(80,464,619,45,'#f1f5fb',6)
for x,t in [(98,'INVOICE'),(270,'CUSTOMER'),(508,'AMOUNT')]:u.text(x,493,t,13,u.muted,700)
for i,(a,b,c) in enumerate([('INV-0248','Harbor Traders','₹ 18,400'),('INV-0247','Greenline Stores','₹ 12,600'),('INV-0246','Metro Supplies','₹ 8,950'),('INV-0245','Cedar Retail','₹ 22,100')]):
    y=548+i*64;u.text(98,y,a,18,weight=600);u.text(270,y,b,18);u.text(674,y,c,18,anchor='end');u.rule(80,y+23,699,y+23)
u.rect(737,409,380,373,'#edf3ff',12)
u.text(763,450,'Ask your business',24,weight=600)
u.rect(757,474,340,64,'#ffffff',8)
u.text(776,513,'What needs my attention?',20,u.ink,600)
u.text(763,581,'Receivables',18,u.accent,700)
u.text(763,610,'Review the overdue invoices',17)
u.text(763,635,'before the next billing cycle.',17)
u.text(763,683,'Inventory',18,u.accent,700)
u.text(763,712,'8 products are below their',17)
u.text(763,737,'configured reorder levels.',17)
u.finish()

# TravelPass — identity credential and selective disclosure, with a mobile treatment.
u=UI('travelpass','TravelPass','Prove what matters. Share only what is needed.','#dceae5','#123e36','#64857a','#1c7863','#f8fdf9','#c9dcd4')
u.rect(49,180,1101,631,'#f6fcf8',20,u.line)
u.text(87,237,'TP / Travel identity',25,weight=700)
u.text(87,316,'One credential.',40,weight=600)
u.text(87,362,'You control the details.',40,weight=600)
u.text(87,414,'Selective disclosure',20,u.muted)
u.rect(87,451,554,233,'#e6f2eb',12)
u.text(111,492,'A service requests',17,u.muted)
for y,a,b in [(537,'Valid travel credential','SHARE'),(588,'Full identity document','PRIVATE'),(639,'Travel history','PRIVATE')]:
    u.text(111,y,a,20,weight=600);u.pill(503,y-23,112,b,'#c8e7d8' if b=='SHARE' else '#edf5f0',u.accent)
u.pill(88,717,230,'Review request',u.accent)
u.rect(710,213,345,562,'#173f37',36)
u.rect(722,225,321,538,'#f8fdf9',27)
u.rect(832,239,100,8,'#b5cdc1',4)
u.text(745,290,'My TravelPass',22,weight=600)
u.rect(744,315,275,176,'#1c7863',17)
u.text(765,352,'TRAVEL CREDENTIAL',13,'#bde7d1',700)
u.text(765,399,'Identity verified',27,'#ffffff',600)
u.text(765,441,'Private by default',16,'#bde7d1')
u.text(765,469,'Concept credential',12,'#bde7d1')
u.text(745,535,'Disclosure request',18,weight=600)
u.text(745,570,'Credential validity only',16,u.muted)
u.rule(744,591,1020,591)
u.text(745,625,'Personal details',16,u.muted);u.text(1018,625,'Hidden',16,u.accent,600,anchor='end')
u.pill(744,668,275,'Approve disclosure',u.accent)
u.finish()

print('Created eight distinct product-interface thumbnails.')

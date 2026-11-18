(()=>{'use strict';const input=document.getElementById('ticketPhoto'),status=document.getElementById('cameraMessage');const btn=document.createElement('button');btn.type='button';btn.textContent='Read ticket photo again';btn.hidden=true;input.insertAdjacentElement('afterend',btn);const scanStatus=document.createElement('p');scanStatus.id='automaticScanStatus';scanStatus.setAttribute('role','status');scanStatus.style.cssText='font-weight:700;padding:12px;background:#e4eff8;border-radius:8px;margin:8px 0';scanStatus.textContent='Ready for automatic scanning.';input.insertAdjacentElement('afterend',scanStatus);input.addEventListener('change',()=>{const file=input.files&&input.files[0];if(!file){scanStatus.textContent='Ready for automatic scanning.';return;}if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>10*1024*1024){scanStatus.textContent='Unsupported image or image over 10 MB.';return;}scanStatus.textContent='Automatic scan started. Reading ticket…';setTimeout(()=>{if(input.files?.[0]===file&&!busy)btn.click();},100);});let busy=false;btn.onclick=async()=>{if(busy||!input.files?.[0])return;busy=true;btn.disabled=true;scanStatus.textContent='Scanning ticket now. Please wait; nothing is being saved.';try{if(!window.Tesseract){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Scanner library could not load'));document.head.appendChild(s)})}const worker=await Tesseract.createWorker('eng');let result;try{const img=await createImageBitmap(input.files[0]);const scale=Math.min(3,2600/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){const gray=.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2];const contrast=Math.max(0,Math.min(255,(gray-128)*1.65+128));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=contrast}ctx.putImageData(pixels,0,0);result=await worker.recognize(canvas);if((result.data.text||'').replace(/\s/g,'').length<35){const original=await worker.recognize(input.files[0]);if((original.data.text||'').length>(result.data.text||'').length)result=original}img.close()}finally{await worker.terminate()}let extra='';try{const pic=await createImageBitmap(input.files[0]);const crop=document.createElement('canvas');crop.width=1800;crop.height=850;const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);cx.drawImage(pic,0,pic.height*.55,pic.width*.7,pic.height*.38,0,0,crop.width,crop.height);const detail=await Tesseract.createWorker('eng');try{extra=(await detail.recognize(crop)).data.text||''}finally{await detail.terminate()}pic.close()}catch(e){}let instructionCrop='';try{const pic=await createImageBitmap(input.files[0]);const crop=document.createElement('canvas');crop.width=1800;crop.height=900;const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);cx.drawImage(pic,0,pic.height*.46,pic.width*.65,pic.height*.24,0,0,crop.width,crop.height);const detail=await Tesseract.createWorker('eng');try{instructionCrop=(await detail.recognize(crop)).data.text||''}finally{await detail.terminate()}pic.close()}catch(e){}const text=(result.data.text||'')+'\n'+extra+'\n'+instructionCrop;const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
// Screenshots may include browser chrome and saved-photo headings. Ignore them as feed candidates.
const ignoreScreenshotText=x=>/saved ticket photograph|close photograph|github\.io|safari|original saved photo/i.test(x);const diagnostic=document.getElementById('feedOcrDiagnostic')||document.createElement('pre');diagnostic.id='feedOcrDiagnostic';diagnostic.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;background:#fff;padding:10px;border:1px solid #b5c5d1;border-radius:8px';diagnostic.textContent='TEST SCANNER TEXT (not saved):\\n'+text.slice(0,2800);status.insertAdjacentElement('afterend',diagnostic);diagnostic.hidden=true;let diagnosticToggle=document.getElementById('feedOcrDiagnosticToggle');if(!diagnosticToggle){diagnosticToggle=document.createElement('button');diagnosticToggle.type='button';diagnosticToggle.id='feedOcrDiagnosticToggle';diagnosticToggle.textContent='Show scanner troubleshooting text';diagnosticToggle.style.cssText='margin:8px 0;background:#e5edf3;color:#233c52';diagnostic.insertAdjacentElement('beforebegin',diagnosticToggle);diagnosticToggle.addEventListener('click',()=>{diagnostic.hidden=!diagnostic.hidden;diagnosticToggle.textContent=diagnostic.hidden?'Show scanner troubleshooting text':'Hide scanner troubleshooting text';});}diagnosticToggle.hidden=false;// Test-only feed description extraction: accept the printed Product Description label and its next line.
let scannedFeed='';
const feedClean=x=>String(x||'').replace(/\b(?:Scale\s*Weights?|Gross|Tare|Net)\s*[:]?\s*.*$/i,'').replace(/\s+/g,' ').trim();
const feedLooksValid=x=>!ignoreScreenshotText(x)&&x.length>=3&&x.length<=120&&/[A-Za-z]{2,}/.test(x)&&!/(?:\d{4,}|\b(?:lbs?|pounds?|county|road|schlater|tackett|driver|truck|gross|tare|net|shipped|dispatched|delivery|ticket|scale|weights?)\b)/i.test(x)&&!/^product\s*description\b/i.test(x);
for(let i=0;i<lines.length;i++){
 const m=lines[i].match(/(?:product\s*description|feed\s*(?:type|description))\s*[:#-]?\s*(.*)$/i);
 if(!m)continue;
 const candidates=[feedClean(m[1]),feedClean(lines[i+1]),feedClean(lines[i+2])];
 scannedFeed=candidates.find(feedLooksValid)||'';
 if(scannedFeed)break;
}
// Do not accept short feed-name pattern matches (e.g. "DW 28 Spec").
// Full printed product descriptions are needed to keep different feeds separate.
// Product descriptions are open-ended: recognize any legible product name, not a fixed feed list.
// Read the printed product-description area as separate lines with layout-aware OCR.
let feedCropReadings=[];
if(!scannedFeed || /^(?:DW\\s+)?28\\s+Spec$/i.test(scannedFeed)){
 scannedFeed='';
 try{
  const pic=await createImageBitmap(input.files[0]);
  const detail=await Tesseract.createWorker('eng');
  const bad=/^(?:product|description|delivery|instructions|shipped|dispatched|scale|gross|tare|net|ticket|tons|date|driver|truck|trailer|customer|order|destination|lbs|weight|total)\b/i;
  const candidate=line=>{
   const x=String(line||'').replace(/[|_~]+/g,' ').replace(/\s+/g,' ').trim();
   if(x.length<4||x.length>85||bad.test(x)||/\d{5,}/.test(x)||!/[a-z]{2,}/i.test(x))return '';
   if(!/[a-z]{2,}.*[a-z0-9]{2,}/i.test(x))return '';
   return x;
  };
  try{
   await detail.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});
   const regions=[[.10,.285,.40,.145],[.10,.315,.40,.115],[.10,.27,.46,.18]];
   for(const [x,y,w,h] of regions){
    const crop=document.createElement('canvas');crop.width=1800;crop.height=480;
    const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);
    cx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,crop.width,crop.height);
    const raw=(await detail.recognize(crop)).data.text||'';
    feedCropReadings.push('PRODUCT AREA '+(feedCropReadings.length+1)+': '+(raw.trim()||'[no text detected]'));
    const rows=raw.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
    const label=rows.findIndex(v=>/product\s*(?:description|desc)|feed\s*(?:type|description)/i.test(v));
    if(label<0)continue;
    const onLabel=rows[label].replace(/^.*?(?:product\s*(?:description|desc)|feed\s*(?:type|description))\s*[:#-]?/i,'');
    const found=[onLabel,...rows.slice(label+1,label+3)].map(candidate).filter(Boolean);
    const best=found.sort((a,b)=>b.length-a.length)[0];
    if(best && best.length>(scannedFeed||'').length)scannedFeed=best;
   }
  }finally{await detail.terminate();pic.close();}
 }catch(e){/* Never invent feed descriptions. Driver confirms manually. */}
}
// Fallback for photos with extra margins: the product label can be outside
// a tight crop. Read horizontal bands and accept a product line even when
// the label was missed, but only if it resembles a feed description.
if(!scannedFeed){
 try{
  const pic=await createImageBitmap(input.files[0]);
  const worker=await Tesseract.createWorker('eng');
  try{
   await worker.setParameters({tessedit_pageseg_mode:'6'});
   for(const [x,y,w,h] of [[.08,.38,.55,.13],[.08,.44,.55,.13],[.08,.49,.55,.13],[.08,.54,.55,.13],[.08,.60,.55,.13]]){
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=340;
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,1600,340);
    ctx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,1600,340);
    const raw=(await worker.recognize(canvas)).data.text||'';
    feedCropReadings.push('FALLBACK BAND '+y+': '+(raw.trim()||'[no text detected]'));
    const rows=raw.split(/\r?\n/).map(v=>v.replace(/\s+/g,' ').trim()).filter(Boolean);
    const product=rows.find(v=>/\b(?:DW|DWV|DWVV)\\s*\\d{1,2}\s*(?:Spec|Special)\\b/i.test(v));
    if(product){
      scannedFeed=product.replace(/^.*?\b(?=DWV?V?\s*\d{1,2}\s*(?:Spec|Special)\\b)/i,'').replace(/\\s{2,}.*$/,'').trim();
      break;
    }
   }
  }finally{await worker.terminate();pic.close()}
 }catch(e){/* Keep manual verification available. */}
}
// Recover the complete printed product name from any OCR pass, including screenshots
// of saved photographs. Do not use a partial label or infer a product.
if(!scannedFeed){
 const allFeedText=[result.data.text||'',extra,instructionCrop,...feedCropReadings].join('\n');
 const productLines=allFeedText.split(/\r?\n/);
 const validProduct=/\b(?:DW|DWV|DWVV)\s*\d{1,2}\s*(?:Spec|Special)\s+[A-Za-z][A-Za-z0-9]*(?:\s+[A-Za-z][A-Za-z0-9]*){0,6}/i;
 for(const line of productLines){
  const match=line.match(validProduct);
  if(!match)continue;
  const cleaned=match[0].replace(/\s+(?:Gross|Tare|Net|Scale|Weights?|Shipped|Dispatched|Lbs?|Pounds?)\b.*$/i,'').trim();
  if(cleaned.length>10){scannedFeed=cleaned;break;}
 }
}
// Prefer a complete feed name explicitly present in any OCR pass over a blank field.
// The source line must contain the printed DW product code, not UI placeholder text.
if(!scannedFeed){
 const all=[result.data.text||'',extra,instructionCrop,...feedCropReadings].join('\n');
 for(const line of all.split(/\r?\n/)){
  if(ignoreScreenshotText(line)||/e\.g\.|placeholder|Feed type \(test/i.test(line))continue;
  const m=line.match(/\bDW\s+\d{1,2}\s+(?:Spec|Special)\s+(?:Iron|Fry\s*(?:II|11|ll|2)|Mini\s*Pellets?|Dust|Fines|[A-Za-z]{3,})(?:\s+[A-Za-z]{2,}){0,3}/i);
  if(m){scannedFeed=m[0].replace(/\s+(?:Gross|Tare|Net|Shipped|Scale|Lbs)\b.*$/i,'').trim();break;}
 }
}
if(/^DW\s*28\s*Spec\s*Iron\s+Gro(?:ss)?$/i.test(String(scannedFeed||"").trim()))scannedFeed="DW 28 Spec Iron";
if(feedCropReadings.length){diagnostic.textContent+='\n\n'+feedCropReadings.join('\n\n').slice(0,2800)}
const number=(text.match(/(?:ticket|load|order)\s*(?:no\.?|number|#|:)?\s*([0-9]{5,8})/i)||text.match(/\b(10[0-9]{4})\b/))?.[1];const shipped=text.match(/\bshipped\s*[:#-]?\s*(\d{1,3}[.,]\d{1,2})\s*(?:tons?|ton\b)/i);const stated=text.match(/(?:net\s*tons?|tons?|tonnage)\s*[:#-]?\s*(\d{1,3}[.,]\d{1,2})/i);const netPounds=text.match(/\bnet\s*[:#-]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:lbs?|pounds?)?/i);let tons=(shipped||stated)?.[1]?.replace(',','.');if(!tons&&netPounds){const pounds=Number(netPounds[1].replace(/,/g,''));if(pounds>=10000&&pounds<=100000)tons=(pounds/2000).toFixed(2)}const instructionIndex=lines.findIndex(x=>/delivery\s*instructions?/i.test(x));const nearby=instructionIndex>=0?lines.slice(instructionIndex,instructionIndex+5):lines;// Delta Western instructions may read "304, D Tank" (tank suffix after the number).
// Prefer the full instruction over numeric-only OCR fallbacks; do not infer missing letters.
const deliveryInstructionLines=instructionIndex>=0?lines.slice(instructionIndex,instructionIndex+5):[];
function fullNumberLetterTank(line){
  const m=line.match(/(?:^|[:\\s])(?:destination\\s*[:#-]?\\s*)?(\\d{1,4})\\s*[,;.]?\\s*([A-Z]{1,3})\\s*(?:tank|tnk)\\b/i);
  return m?m[1]+', '+m[2].toUpperCase()+' Tank':'';
}
const fullInstructionDestination=deliveryInstructionLines.map(fullNumberLetterTank).find(Boolean)
  ||(instructionIndex>=0?fullNumberLetterTank(lines[instructionIndex]):'')
  ||(instructionIndex>=0?fullNumberLetterTank(instructionCrop):'');
// Delta Western prints some destinations as "Tank 708, F" (letter after Tank number).
// Preserve that explicit suffix; never guess a letter from a number alone.
const numberedSuffix=deliveryInstructionLines.concat(instructionCrop.split(/\r?\n/)).map(line=>line.match(/\b(?:tank|tnk)\s*[:#-]?\s*(\d{2,4})\s*[,;.]\s*([A-Z])\b/i)).find(Boolean);
const tankLines=nearby.filter(x=>/\b(?:tank|tnk)\s*[:#-]?\s*\d{2,4}\b/i.test(x));const tankLine=tankLines[0]||lines.find(x=>/\b(?:tank|tnk)\s*[:#-]?\s*\d{2,4}\b/i.test(x))||'';const tankMatch=tankLine.match(/\b(?:tank|tnk)\s*[:#-]?\s*(\d{2,4})\s*[,;.]?\s*([A-Z]{1,3}\s*[- ]?\d{1,2})?/i);let dest=tankMatch?'Tank '+tankMatch[1]+(tankMatch[2]?', '+tankMatch[2].replace(/\s+/g,''):''):'';if(!dest&&instructionIndex>=0){const sameLine=lines[instructionIndex].match(/delivery\s*instructions?\s*[:#-]?\s*(\d{2,4})\s*$/i);if(sameLine)dest=sameLine[1]}if(!dest&&instructionIndex>=0){const following=lines.slice(instructionIndex+1,instructionIndex+4);for(const line of following){const match=line.match(/^(?:destination\s*[:#-]?\s*)?(\d{2,4}(?:\s*[A-Z]{1,3}\s*[- ]?\d{1,2})?(?:\s*(?:&|\/|,|and)\s*(?:\d{2,4}\s*)?[A-Z]{0,3}\s*[- ]?\d{1,3})?)\s*$/i);if(match){dest=match[1].replace(/\s+/g,' ').trim();break}}}if(tankMatch){const bin=tankMatch[2]?.replace(/\s+/g,'')||'';const after=tankLine.slice(tankMatch.index+tankMatch[0].length);const second=after.match(/(?:&|and|\+|,|;)\s*([A-Z]{1,3})\s*[- ]?(\d{1,2})\b/i);if(second){dest+=' & '+second[1].toUpperCase()+second[2]}else if(bin&&/[&+]\s*$/.test(tankLine)){status.textContent='Second bin was not legible; check delivery instructions.'}}if(fullInstructionDestination)dest=fullInstructionDestination;if(numberedSuffix)dest="Tank "+numberedSuffix[1]+", "+numberedSuffix[2].toUpperCase();// Independently read the delivery-instructions area to recover tank letters.
// Use only an explicit number + letter + Tank match; never infer a suffix.
if(!fullInstructionDestination){
 try{
  const pic=await createImageBitmap(input.files[0]);
  const detail=await Tesseract.createWorker('eng');
  try{
   await detail.setParameters({tessedit_pageseg_mode:'6'});
   for(const [x,y,w,h] of [[.05,.48,.48,.18],[.04,.52,.43,.15]]){
    const crop=document.createElement('canvas');crop.width=1600;crop.height=550;
    const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);
    cx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,crop.width,crop.height);
    const raw=(await detail.recognize(crop)).data.text||'';
    const m=raw.match(/\b(\d{2,4})\s*[,;.]?\s*([A-Z]{1,3})\s*(?:Tank|Tnk)\b/i);
    if(m){dest=m[1]+', '+m[2].toUpperCase()+' Tank';break}
   }
  }finally{await detail.terminate();pic.close()}
 }catch(e){/* Manual destination correction remains available. */}
}
if(!dest){const match=instructionCrop.match(/delivery\s*instructions?\s*[:#-]?\s*(?:\n|\s)+\s*(\d{2,4})\b/i);if(match)dest=match[1]}if(!dest&&instructionCrop){const cropLines=instructionCrop.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);const labelAt=cropLines.findIndex(s=>/delivery\s*instructions?/i.test(s));if(labelAt>=0){const candidate=cropLines.slice(labelAt+1,labelAt+4).map(s=>s.match(/^\D{0,3}(\d{2,4})\D{0,3}$/)?.[1]).find(Boolean);if(candidate)dest=candidate}}if(!dest){try{const pic=await createImageBitmap(input.files[0]);const crop=document.createElement('canvas');crop.width=1600;crop.height=600;const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);cx.drawImage(pic,0,pic.height*.51,pic.width*.36,pic.height*.115,0,0,crop.width,crop.height);const detail=await Tesseract.createWorker('eng');try{const raw=(await detail.recognize(crop)).data.text||'';const match=raw.match(/(?:^|\n)\s*(\d{2,4})\s*(?:\n|$)/m)||raw.match(/delivery\s*instructions?\s*[:#-]?\s*(\d{2,4})/i);if(match)dest=match[1]}finally{await detail.terminate()}pic.close()}catch(e){}}if(!dest&&/DELTA|WESTERN|delivery\s*instructions?/i.test(text)){try{const pic=await createImageBitmap(input.files[0]);const worker=await Tesseract.createWorker('eng');try{await worker.setParameters({tessedit_char_whitelist:'0123456789',tessedit_pageseg_mode:'7'});const regions=[[.035,.539,.19,.038],[.035,.535,.25,.075],[.025,.525,.30,.11]];for(const [x,y,w,h] of regions){const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=300;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,canvas.width,canvas.height);const raw=(await worker.recognize(canvas)).data.text||'';const candidates=raw.match(/\b\d{2,4}\b/g)||[];if(candidates.length===1){dest=candidates[0];break}}}finally{await worker.terminate();pic.close()}}catch(e){}}
// Single-digit tank numbers are common on Delta Cat tickets. Read a clearly
// labeled "Tank 3" from any OCR pass, including the instructions crop.
const labeledTankSources=[result.data.text||'',instructionCrop,extra].join('\n');
const labeledSingleTank=labeledTankSources.match(/\b(?:tank|tnk)\s*[:#-]?\s*([1-9])\b/i);
if(labeledSingleTank && !fullInstructionDestination && !/\b(?:tank|tnk)\s*[:#-]?\s*\d{2,4}\b/i.test(labeledTankSources))dest='Tank '+labeledSingleTank[1];
// Reset the previous unsaved scan so a missing field cannot inherit an older ticket.
for(const id of ['draftDate','draftNumber','draftTons','draftFeedType','draftDestination']){
 const field=document.getElementById(id);
 if(field){field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));}
}
let scannedDate='';
// OCR sometimes inserts a space within a two-digit day (11/1 7/2026).
// Repair only dates next to a shipment/dispatch label, never unrelated numbers.
const dateText=text.replace(/(\b(?:dispatched|shipped\s*(?:on|date)?|delivery\s*date)\s*[:#-]?\s*\d{1,2}\s*[\/.\-]\s*)(\d)\s+(\d)(\s*[\/.\-]\s*\d{4}\b)/gi,(_all,prefix,d1,d2,suffix)=>prefix+d1+d2+suffix);
const dateSource=dateText.match(/(?:dispatched|shipped\s*(?:on|date)?|delivery\s*date)\s*[:#-]?\s*(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{2,4})/i);
// Some Delta Western tickets print the date after the shipped tonnage on one line.
// OCR may lose the word "Dispatched" while retaining the numeric date.
// Accept a fallback only when the date is on a line mentioning shipment/dispatch.
let fallbackDate=null;
if(!dateSource){
  for(const line of lines){
    if(!/shipped|dispatch|delivery\s*date/i.test(line))continue;
    const normalized=line.replace(/(\d{1,2}\s*[\/.-]\s*)(\d)\s+(\d)(\s*[\/.-]\s*\d{4}\b)/g,(_all,p,a,b,z)=>p+a+b+z);
    const m=normalized.match(/\b(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{2,4})\b/);
    if(m){fallbackDate=m;break;}
  }
}
if(dateSource||fallbackDate){
  const dateMatch=dateSource||fallbackDate;
  const mm=Number(dateMatch[1]),dd=Number(dateMatch[2]);
  const rawYear=Number(dateMatch[3]),yy=rawYear<100?2000+rawYear:rawYear;
  const parsed=new Date(yy,mm-1,dd);
  if(mm>=1&&mm<=12&&dd>=1&&dd<=31&&yy>=2020&&yy<=2100&&parsed.getFullYear()===yy&&parsed.getMonth()===mm-1&&parsed.getDate()===dd&&parsed.getDay()!==0){
    scannedDate=String(yy).padStart(4,'0')+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
  }
}
// Match dispatch dates with OCR-spaced day digits, e.g. "11/1 7/2026".
if(!scannedDate){
 const dispatch=text.match(/\bdispatched\b[\s:–-]*([0-1]?\d)\s*[\/.\-]\s*(\d)(?:[ \t\r\n]+(\d))?\s*[\/.\-]\s*(20\d{2})\b/i);
 if(dispatch){
  const mm=Number(dispatch[1]),dd=Number(dispatch[2]+(dispatch[3]||'')),yy=Number(dispatch[4]);
  const d=new Date(yy,mm-1,dd);
  if(d.getFullYear()===yy&&d.getMonth()===mm-1&&d.getDate()===dd&&d.getDay()!==0)scannedDate=yy+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
 }
}
// When the full-page OCR misses the dispatch date, scan the printed
// Shipped / Dispatched line in several overlapping upper-middle crops.
if(!scannedDate){
 try{
  const pic=await createImageBitmap(input.files[0]);
  const worker=await Tesseract.createWorker('eng');
  try{
   await worker.setParameters({tessedit_pageseg_mode:'6'});
   const regions=[[.12,.33,.65,.19],[.12,.38,.72,.16],[.16,.40,.65,.18],[.08,.27,.80,.30]];
   for(const [x,y,w,h] of regions){
    const canvas=document.createElement('canvas');
    canvas.width=1900;canvas.height=500;
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,canvas.width,canvas.height);
    const raw=(await worker.recognize(canvas)).data.text||'';
    const dateLine=raw.split(/\\r?\\n/).find(line=>/shipped|dispatch|delivery\\s*date/i.test(line))||'';
    const m=dateLine.match(/\\b(\\d{1,2})\\s*[\\/.-]\\s*(\\d{1,2})\\s*[\\/.-]\\s*(\\d{2,4})\\b/);
    if(!m)continue;
    const mm=Number(m[1]),dd=Number(m[2]),year=Number(m[3]),yy=year<100?year+2000:year;
    const dt=new Date(yy,mm-1,dd);
    if(yy>=2020&&yy<=2100&&dt.getFullYear()===yy&&dt.getMonth()===mm-1&&dt.getDate()===dd&&dt.getDay()!==0){
     scannedDate=String(yy).padStart(4,'0')+'-'+String(mm).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
     break;
    }
   }
  }finally{await worker.terminate();pic.close();}
 }catch(e){diagnostic.textContent+='\\nDate OCR unavailable: '+String(e.message||e);}
}
// Identify the delivery customer from printed Ship To / Sold To names, never the feed supplier's logo.
const customerSelect=document.getElementById('draftCustomer');
const customerText=[result.data.text||'',extra].join('\n');
const customerLines=customerText.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
const namedCustomerLine=customerLines.some((line,i)=>{
 if(!/^(?:ship\s*to|sold\s*to|customer|consignee)\s*:/i.test(line))return false;
 return /delta\s*cat\s*fisheries|tackett\s*(?:fish\s*farm|farms?)/i.test([line,customerLines[i+1]||'',customerLines[i+2]||''].join(' '));
});
const directCustomerNames=customerLines.filter(v=>/delta\s*cat\s*fisheries|tackett\s*(?:fish\s*farm|farms?)/i.test(v));
let recognizedCustomer='';
if(namedCustomerLine || directCustomerNames.length){
 const isDelta=directCustomerNames.some(v=>/delta\s*cat\s*fisheries/i.test(v));
 const isTackett=directCustomerNames.some(v=>/tackett\s*(?:fish\s*farm|farms?)/i.test(v));
 if(isDelta!==isTackett)recognizedCustomer=isDelta?'Delta Cat':'Tackett Fish Farm';
}
if(customerSelect){
 const match=[...customerSelect.options].find(o=>o.textContent.trim().toLowerCase()===recognizedCustomer.toLowerCase());
 if(recognizedCustomer && match){customerSelect.value=match.value;customerSelect.dispatchEvent(new Event('input',{bubbles:true}));}
 else {customerSelect.value='';customerSelect.dispatchEvent(new Event('input',{bubbles:true}));}
}
// Delta Western: prioritize the labeled ticket number and complete delivery-instruction line.
// Do not guess missing pond suffixes from a numeric-only OCR pass.
let verifiedNumber=number;
const ticketLabelCandidates=[result.data.text||'',extra,instructionCrop].join('\n').match(/(?:delivery\s*)?ticket\s*(?:number|no\.?|#)\s*[:#]?\s*(\d{6,8})\b/i);
if(ticketLabelCandidates)verifiedNumber=ticketLabelCandidates[1];
let verifiedDest=dest;
// Retain an explicitly labeled one-digit tank after all OCR refinements.
if(!verifiedDest){
 const explicitOneDigit=[result.data.text||'',instructionCrop,extra].join('\n').match(/\b(?:tank|tnk)\s*[:#-]?\s*([1-9])\b/i);
 if(explicitOneDigit)verifiedDest='Tank '+explicitOneDigit[1];
}
const instructionSources=[result.data.text||'',instructionCrop,extra].join('\n');
const tankPondPattern=/\b(?:tank|tnk)\s*[:#-]?\s*(\d{2,4})\s*[,;. ]+\s*([A-Z]{1,3}\s*[- ]?\d{1,3})\b/i;
const explicitTankPond=instructionSources.match(tankPondPattern);
if(explicitTankPond)verifiedDest=explicitTankPond[1]+', '+explicitTankPond[2].replace(/\s+/g,'').toUpperCase();
if(!explicitTankPond && /delivery\s*instructions?|delta\s*western/i.test(instructionSources)){
 try{
  const pic=await createImageBitmap(input.files[0]);
  const w=await Tesseract.createWorker('eng');
  try{
   await w.setParameters({tessedit_pageseg_mode:'6'});
   // Wide overlapping crops account for variable margins and phone-camera framing.
   for(const [x,y,ww,hh] of [[.10,.37,.48,.22],[.08,.41,.52,.25],[.10,.47,.48,.20]]){
    const canvas=document.createElement('canvas');canvas.width=2000;canvas.height=650;
    const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(pic,pic.width*x,pic.height*y,pic.width*ww,pic.height*hh,0,0,canvas.width,canvas.height);
    const raw=(await w.recognize(canvas)).data.text||'';
    const m=raw.match(tankPondPattern);
    if(m){verifiedDest=m[1]+', '+m[2].replace(/\s+/g,'').toUpperCase();break;}
   }
  }finally{await w.terminate();pic.close();}
 }catch(e){/* Require manual verification if OCR remains unclear. */}
}
// Preserve a single printed suffix in "Tank 708, F", not just suffixes with digits.
const singleSuffix=/\b(?:tank|tnk)\s*[:#-]?\s*(\d{2,4})\s*[,;.]\s*([A-Z])\b/i;
const suffixEvidence=[result.data.text||'',instructionCrop,extra].join('\n').match(singleSuffix);
if(suffixEvidence)verifiedDest='Tank '+suffixEvidence[1]+', '+suffixEvidence[2].toUpperCase();
// Final destination pass: OCR often loses the small single-digit "Tank 3" on
// the full page. Existing destination crops only looked for multi-digit ponds.
// Read the delivery-instructions region itself with overlapping crops and
// use only an explicitly printed tank label, never an isolated numeral.
if(!verifiedDest){
 try{
  const pic=await createImageBitmap(input.files[0]);
  const worker=await Tesseract.createWorker('eng');
  try{
   await worker.setParameters({tessedit_pageseg_mode:'6'});
   const regions=[[.05,.40,.56,.24],[.05,.46,.54,.25],[.07,.50,.45,.18],[.05,.54,.52,.18]];
   for(const [x,y,w,h] of regions){
    const canvas=document.createElement('canvas');canvas.width=1700;canvas.height=650;
    const cx=canvas.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,canvas.width,canvas.height);
    cx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,canvas.width,canvas.height);
    const raw=(await worker.recognize(canvas)).data.text||'';
    diagnostic.textContent+='\nDESTINATION CROP '+y+': '+(raw.trim()||'[no text detected]').slice(0,300);
    const lines=raw.split(/\r?\n/).map(v=>v.trim()).filter(Boolean);
    const instructionAt=lines.findIndex(v=>/delivery\s*instructions?/i.test(v));
    const relevant=instructionAt>=0?lines.slice(instructionAt,instructionAt+5).join('\n'):raw;
    const m=relevant.match(/\b(?:tank|tnk)\s*[:#-]?\s*([1-9])\b/i);
    if(m){verifiedDest='Tank '+m[1];break;}
   }
  }finally{await worker.terminate();pic.close();}
 }catch(e){diagnostic.textContent+='\nDestination OCR error: '+String(e.message||e);}
}
// Prefer a complete, label-adjacent printed product description; discard stray OCR prefixes.
if(scannedFeed){
 scannedFeed=scannedFeed.replace(/^\s*(?:Ta|To)\s+(?=DW\s+\d)/i,'').trim();
}
// Independently read the upper product-description region, which is above
// Delivery Instructions on Delta Western tickets. Keep the existing number,
// weight, destination and date extraction untouched.
try {
 const image=await createImageBitmap(input.files[0]);
 const worker=await Tesseract.createWorker('eng');
 try {
  await worker.setParameters({tessedit_pageseg_mode:'6'});
  const productCandidates=[];
  const regions=[
   [.10,.17,.54,.32], // full printed ticket photographed directly
   [.10,.29,.53,.19], // photo displayed inside a phone screenshot
   [.18,.33,.45,.14],
   [.04,.20,.65,.36]
  ];
  for(const [x,y,w,h] of regions){
   const canvas=document.createElement('canvas');
   canvas.width=2000;canvas.height=1100;
   const ctx=canvas.getContext('2d');
   ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.drawImage(image,image.width*x,image.height*y,image.width*w,image.height*h,0,0,canvas.width,canvas.height);
   const raw=(await worker.recognize(canvas)).data.text||'';
   feedCropReadings.push('PRODUCT FOCUSED '+(feedCropReadings.length+1)+': '+(raw.trim()||'[no text detected]'));
   const lines=raw.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
   for(let i=0;i<lines.length;i++){
    const line=lines[i];
    const m=line.match(/\b(?:DW|DWV|DWVV)\s*\d{1,2}\s*(?:Spec|Special)\s+[A-Za-z]{3,}(?:\s+[A-Za-z]{3,}){0,2}/i);
    if(m)productCandidates.push(m[0].trim());
    if(/product\s*description/i.test(line)){
     const next=(lines[i+1]||'').match(/\b(?:DW|DWV|DWVV)\s*\d{1,2}\s*(?:Spec|Special)\s+[A-Za-z]{3,}(?:\s+[A-Za-z]{3,}){0,2}/i);
     if(next)productCandidates.push(next[0].trim());
    }
   }
  }
  if(productCandidates.length){
   const counts=new Map();
   for(const candidate of productCandidates)counts.set(candidate,(counts.get(candidate)||0)+1);
   scannedFeed=[...counts].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length)[0][0];
  }
 }finally{await worker.terminate();image.close();}
}catch(e){/* Leave feed description blank if it cannot be read reliably. */}
// Strip OCR fragments of the adjacent Gross heading from the printed Iron feed name.
if(/^DW\s*28\s*Spec\s*Iron\s+Gro(?:ss)?$/i.test(String(scannedFeed||"").trim()))scannedFeed="DW 28 Spec Iron";
// A nearby scale-weight heading is not a feed description. Prefer a legible
// complete product code from any OCR pass; never populate a guessed feed name.
const feedEvidence=[result.data.text||'',extra,instructionCrop,...feedCropReadings].join('\n');
const completeProduct=/\b(?:DW|DWV|DWVV)\s*\d{1,2}\s*(?:Spec|Special)\s+[A-Za-z][A-Za-z0-9]*(?:\s+[A-Za-z][A-Za-z0-9]*){0,3}/ig;
function cleanProduct(v){
 let value=String(v||'').replace(/\s+/g,' ').trim();
 // OCR can merge a heading directly after "Bulk", e.g. "BulkPRODUCT".
 const boundary=value.match(/^((?:DW|DWV|DWVV)\s*\d{1,2}\s*(?:Spec|Special)\s+Bulk)(?=\b|PRODUCT|DESCRIPTION|SCALE|WEIGHTS|GROSS|TARE|NET|SHIPPED|DISPATCHED)/i);
 if(boundary)return boundary[1];
 return value.split(/\s+(?:PRODUCT|DESCRIPTION|SCALE|WEIGHTS?|GROSS|TARE|NET|SHIPPED|DISPATCHED|LBS)\b/i)[0].trim();
}
const products=[...feedEvidence.matchAll(completeProduct)].map(m=>cleanProduct(m[0])).filter(Boolean);
// FRY II / FLY II is a valid printed feed type even without a DW product code.
// Require a whole feed name in the OCR evidence, not an isolated numeral.
const fryEvidence=feedEvidence.match(/\b(?:FRY|FLY)\s*(?:II|ll|11|2)\s*(?:BULK|FEED|PELLETS?)?\b/ig)||[];
const normalizeFry=v=>v.replace(/\b(FRY|FLY)\s*(?:II|ll|11|2)\b/i,(_m,name)=>name.toUpperCase()+' II').replace(/\s+/g,' ').trim();
const fryProducts=fryEvidence.map(normalizeFry).filter(v=>/^(?:FRY|FLY) II(?: (?:BULK|FEED|PELLETS?))?$/i.test(v));
if(products.length){
 scannedFeed=products.sort((a,b)=>b.length-a.length)[0];
}else if(fryProducts.length){
 scannedFeed=fryProducts.sort((a,b)=>b.length-a.length)[0];
}else if(/\b(?:scale?|scal|gross|tare|net|tonnage|weights?)\b/i.test(scannedFeed)||!(/(?:DW|DWV|DWVV)\s*\d{1,2}\s*(?:Spec|Special)\b/i.test(scannedFeed)||/\b(?:mini\s+pellets?|pellets?\s+(?:bulk|feed)|dust|fines)\b/i.test(scannedFeed))){
 scannedFeed='';
}
scannedFeed=cleanProduct(scannedFeed);
// The scale column can contribute "Gro" from "Gross" after the Iron product.
scannedFeed=scannedFeed.replace(/^(DW\s*28\s*Spec\s*Iron)\s+Gro(?:ss)?(?:\s|$)/i,'$1 ').trim();
let filled=[];if(recognizedCustomer&&customerSelect?.value)filled.push('customer ('+recognizedCustomer+')');function fill(id,value,label){if(!value)return;const el=document.getElementById(id);// New photographs replace the unsaved preview without confirmation dialogs.
el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));filled.push(label)}fill('draftDate',scannedDate,'delivery date');fill('draftNumber',verifiedNumber,'ticket number');fill('draftTons',tons,'tons');fill('draftDestination',verifiedDest,'destination');// OCR often reads the Roman numeral II as 11 or ll in the specific phrase Fry II.
// Only normalize the ambiguous characters in that context, never arbitrary 11 values.
scannedFeed=scannedFeed.replace(/\b(Fry|Fly)\s*(?:11|ll|II)\b/gi,(_m,name)=>name+' II');
fill('draftFeedType',scannedFeed,'feed type');
// Warn immediately when a recognized ticket number is already in cloud history.
// The normal preview and save checks remain in place as independent safeguards.
if(verifiedNumber){
 try{
  const existing=await window.CKCloud.findTicketNumber(String(verifiedNumber));
  if(existing){
   scanStatus.textContent='⚠️ DUPLICATE TICKET '+verifiedNumber+' — already saved'+(existing.delivery_date?' on '+existing.delivery_date:'')+'. This scan is for review only. Do not save again.';
   scanStatus.style.background='#fff0d5';
   scanStatus.style.color='#8a4200';
  }else{
   scanStatus.style.background='#e4eff8';
   scanStatus.style.color='';
  }
 }catch(error){
  scanStatus.textContent='Could not check whether ticket '+verifiedNumber+' is already saved. Do not save until the duplicate check succeeds.';
  scanStatus.style.background='#fff0d5';
  scanStatus.style.color='#8a4200';
 }
}
const feedField=document.getElementById('draftFeedType');
if(!scanStatus.textContent.includes('DUPLICATE TICKET')&&!scanStatus.textContent.includes('Could not check whether ticket'))scanStatus.textContent=filled.length?'Scan complete: '+filled.join(', ')+'. Verify every field, especially the date printed on the ticket. '+(customerSelect?.value?'Customer detected automatically.':'Customer not identified — choose customer manually.')+' Nothing was saved.':'Scan finished, but no reliable fields were found. Enter ticket details manually.';if(!filled.length)scanStatus.textContent='Scanner could not confidently identify ticket fields. Try a closer, well-lit picture with the ticket filling the frame.'}catch(e){scanStatus.textContent='Scanning unavailable: '+e.message+'. You can still enter the ticket manually.'}finally{busy=false;btn.disabled=false}}})();
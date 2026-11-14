(()=>{'use strict';const input=document.getElementById('ticketPhoto'),status=document.getElementById('cameraMessage');const btn=document.createElement('button');btn.type='button';btn.textContent='🔎 Read ticket photo';btn.style.margin='8px 0';btn.hidden=true;input.insertAdjacentElement('afterend',btn);input.addEventListener('change',()=>{btn.hidden=!(input.files&&input.files[0]);if(!btn.hidden){setTimeout(()=>btn.click(),100)}});let busy=false;btn.onclick=async()=>{if(busy||!input.files?.[0])return;busy=true;btn.disabled=true;status.textContent='Reading ticket photo… This may take a minute. Nothing will be uploaded or saved.';try{if(!window.Tesseract){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=resolve;s.onerror=()=>reject(new Error('Scanner library could not load'));document.head.appendChild(s)})}const worker=await Tesseract.createWorker('eng');let result;try{const img=await createImageBitmap(input.files[0]);const scale=Math.min(3,2600/Math.max(img.width,img.height));const canvas=document.createElement('canvas');canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(img,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){const gray=.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2];const contrast=Math.max(0,Math.min(255,(gray-128)*1.65+128));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=contrast}ctx.putImageData(pixels,0,0);result=await worker.recognize(canvas);if((result.data.text||'').replace(/\s/g,'').length<35){const original=await worker.recognize(input.files[0]);if((original.data.text||'').length>(result.data.text||'').length)result=original}img.close()}finally{await worker.terminate()}let extra='';try{const pic=await createImageBitmap(input.files[0]);const crop=document.createElement('canvas');crop.width=1800;crop.height=850;const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);cx.drawImage(pic,0,pic.height*.55,pic.width*.7,pic.height*.38,0,0,crop.width,crop.height);const detail=await Tesseract.createWorker('eng');try{extra=(await detail.recognize(crop)).data.text||''}finally{await detail.terminate()}pic.close()}catch(e){}let instructionCrop='';try{const pic=await createImageBitmap(input.files[0]);const crop=document.createElement('canvas');crop.width=1800;crop.height=900;const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);cx.drawImage(pic,0,pic.height*.46,pic.width*.65,pic.height*.24,0,0,crop.width,crop.height);const detail=await Tesseract.createWorker('eng');try{instructionCrop=(await detail.recognize(crop)).data.text||''}finally{await detail.terminate()}pic.close()}catch(e){}const text=(result.data.text||'')+'\n'+extra+'\n'+instructionCrop;const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);const diagnostic=document.getElementById('feedOcrDiagnostic')||document.createElement('pre');diagnostic.id='feedOcrDiagnostic';diagnostic.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere;font-size:12px;background:#fff;padding:10px;border:1px solid #b5c5d1;border-radius:8px';diagnostic.textContent='TEST SCANNER TEXT (not saved):\\n'+text.slice(0,2800);status.insertAdjacentElement('afterend',diagnostic);diagnostic.hidden=true;let diagnosticToggle=document.getElementById('feedOcrDiagnosticToggle');if(!diagnosticToggle){diagnosticToggle=document.createElement('button');diagnosticToggle.type='button';diagnosticToggle.id='feedOcrDiagnosticToggle';diagnosticToggle.textContent='Show scanner troubleshooting text';diagnosticToggle.style.cssText='margin:8px 0;background:#e5edf3;color:#233c52';diagnostic.insertAdjacentElement('beforebegin',diagnosticToggle);diagnosticToggle.addEventListener('click',()=>{diagnostic.hidden=!diagnostic.hidden;diagnosticToggle.textContent=diagnostic.hidden?'Show scanner troubleshooting text':'Hide scanner troubleshooting text';});}diagnosticToggle.hidden=false;// Test-only feed description extraction: accept the printed Product Description label and its next line.
let scannedFeed='';
const feedClean=x=>String(x||'').replace(/\s{2,}(?:Scale\s*Weights?|Gross|Tare|Net)\b.*$/i,'').trim();
const feedLooksValid=x=>x.length>=3&&x.length<=120&&/[A-Za-z]{2,}/.test(x)&&!/(?:\d{4,}|\b(?:lbs?|pounds?|county|road|schlater|tackett|driver|truck|gross|tare|net|shipped|dispatched|delivery|ticket|scale|weights?)\b)/i.test(x)&&!/^product\s*description\b/i.test(x);
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
if(feedCropReadings.length){diagnostic.textContent+='\n\n'+feedCropReadings.join('\n\n').slice(0,2800)}
const number=(text.match(/(?:ticket|load|order)\s*(?:no\.?|number|#|:)?\s*([0-9]{5,8})/i)||text.match(/\b(10[0-9]{4})\b/))?.[1];const shipped=text.match(/\bshipped\s*[:#-]?\s*(\d{1,3}[.,]\d{1,2})\s*(?:tons?|ton\b)/i);const stated=text.match(/(?:net\s*tons?|tons?|tonnage)\s*[:#-]?\s*(\d{1,3}[.,]\d{1,2})/i);const netPounds=text.match(/\bnet\s*[:#-]?\s*([\d,]+(?:\.\d{1,2})?)\s*(?:lbs?|pounds?)?/i);let tons=(shipped||stated)?.[1]?.replace(',','.');if(!tons&&netPounds){const pounds=Number(netPounds[1].replace(/,/g,''));if(pounds>=10000&&pounds<=100000)tons=(pounds/2000).toFixed(2)}const instructionIndex=lines.findIndex(x=>/delivery\s*instructions?/i.test(x));const nearby=instructionIndex>=0?lines.slice(instructionIndex,instructionIndex+5):lines;// Delta Western instructions may read "304, D Tank" (tank suffix after the number).
// Prefer the full instruction over numeric-only OCR fallbacks; do not infer missing letters.
const deliveryInstructionLines=instructionIndex>=0?lines.slice(instructionIndex,instructionIndex+5):[];
function fullNumberLetterTank(line){
  const m=line.match(/(?:^|[:\\s])(?:destination\\s*[:#-]?\\s*)?(\\d{2,4})\\s*[,;.]?\\s*([A-Z]{1,3})\\s*(?:tank|tnk)\\b/i);
  return m?m[1]+', '+m[2].toUpperCase()+' Tank':'';
}
const fullInstructionDestination=deliveryInstructionLines.map(fullNumberLetterTank).find(Boolean)
  ||(instructionIndex>=0?fullNumberLetterTank(lines[instructionIndex]):'')
  ||(instructionIndex>=0?fullNumberLetterTank(instructionCrop):'');
const tankLines=nearby.filter(x=>/\b(?:tank|tnk)\s*[:#-]?\s*\d{2,4}\b/i.test(x));const tankLine=tankLines[0]||lines.find(x=>/\b(?:tank|tnk)\s*[:#-]?\s*\d{2,4}\b/i.test(x))||'';const tankMatch=tankLine.match(/\b(?:tank|tnk)\s*[:#-]?\s*(\d{2,4})\s*[,;.]?\s*([A-Z]{1,3}\s*[- ]?\d{1,2})?/i);let dest=tankMatch?'Tank '+tankMatch[1]+(tankMatch[2]?', '+tankMatch[2].replace(/\s+/g,''):''):'';if(!dest&&instructionIndex>=0){const sameLine=lines[instructionIndex].match(/delivery\s*instructions?\s*[:#-]?\s*(\d{2,4})\s*$/i);if(sameLine)dest=sameLine[1]}if(!dest&&instructionIndex>=0){const following=lines.slice(instructionIndex+1,instructionIndex+4);for(const line of following){const match=line.match(/^(?:destination\s*[:#-]?\s*)?(\d{2,4}(?:\s*[A-Z]{1,3}\s*[- ]?\d{1,2})?(?:\s*(?:&|\/|,|and)\s*(?:\d{2,4}\s*)?[A-Z]{0,3}\s*[- ]?\d{1,3})?)\s*$/i);if(match){dest=match[1].replace(/\s+/g,' ').trim();break}}}if(tankMatch){const bin=tankMatch[2]?.replace(/\s+/g,'')||'';const after=tankLine.slice(tankMatch.index+tankMatch[0].length);const second=after.match(/(?:&|and|\+|,|;)\s*([A-Z]{1,3})\s*[- ]?(\d{1,2})\b/i);if(second){dest+=' & '+second[1].toUpperCase()+second[2]}else if(bin&&/[&+]\s*$/.test(tankLine)){status.textContent='Second bin was not legible; check delivery instructions.'}}if(fullInstructionDestination)dest=fullInstructionDestination;// Independently read the delivery-instructions area to recover tank letters.
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
if(!dest){const match=instructionCrop.match(/delivery\s*instructions?\s*[:#-]?\s*(?:\n|\s)+\s*(\d{2,4})\b/i);if(match)dest=match[1]}if(!dest&&instructionCrop){const cropLines=instructionCrop.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);const labelAt=cropLines.findIndex(s=>/delivery\s*instructions?/i.test(s));if(labelAt>=0){const candidate=cropLines.slice(labelAt+1,labelAt+4).map(s=>s.match(/^\D{0,3}(\d{2,4})\D{0,3}$/)?.[1]).find(Boolean);if(candidate)dest=candidate}}if(!dest){try{const pic=await createImageBitmap(input.files[0]);const crop=document.createElement('canvas');crop.width=1600;crop.height=600;const cx=crop.getContext('2d');cx.fillStyle='white';cx.fillRect(0,0,crop.width,crop.height);cx.drawImage(pic,0,pic.height*.51,pic.width*.36,pic.height*.115,0,0,crop.width,crop.height);const detail=await Tesseract.createWorker('eng');try{const raw=(await detail.recognize(crop)).data.text||'';const match=raw.match(/(?:^|\n)\s*(\d{2,4})\s*(?:\n|$)/m)||raw.match(/delivery\s*instructions?\s*[:#-]?\s*(\d{2,4})/i);if(match)dest=match[1]}finally{await detail.terminate()}pic.close()}catch(e){}}if(!dest&&/DELTA|WESTERN|delivery\s*instructions?/i.test(text)){try{const pic=await createImageBitmap(input.files[0]);const worker=await Tesseract.createWorker('eng');try{await worker.setParameters({tessedit_char_whitelist:'0123456789',tessedit_pageseg_mode:'7'});const regions=[[.035,.539,.19,.038],[.035,.535,.25,.075],[.025,.525,.30,.11]];for(const [x,y,w,h] of regions){const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=300;const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.drawImage(pic,pic.width*x,pic.height*y,pic.width*w,pic.height*h,0,0,canvas.width,canvas.height);const raw=(await worker.recognize(canvas)).data.text||'';const candidates=raw.match(/\b\d{2,4}\b/g)||[];if(candidates.length===1){dest=candidates[0];break}}}finally{await worker.terminate();pic.close()}}catch(e){}}let scannedDate='';
const dateSource=text.match(/(?:dispatched|shipped\s*(?:on|date)?|delivery\s*date)\s*[:#-]?\s*(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{2,4})/i);
// Some Delta Western tickets print the date after the shipped tonnage on one line.
// OCR may lose the word "Dispatched" while retaining the numeric date.
// Accept a fallback only when the date is on a line mentioning shipment/dispatch.
let fallbackDate=null;
if(!dateSource){
  for(const line of lines){
    if(!/shipped|dispatch|delivery\s*date/i.test(line))continue;
    const m=line.match(/\b(\d{1,2})\s*[\/.-]\s*(\d{1,2})\s*[\/.-]\s*(\d{2,4})\b/);
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
let filled=[];function fill(id,value,label){if(!value)return;const el=document.getElementById(id);if(el.value.trim()&&!confirm('Replace '+label+' with scanned value: '+value+'?'))return;el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));filled.push(label)}fill('draftDate',scannedDate,'delivery date');fill('draftNumber',number,'ticket number');fill('draftTons',tons,'tons');fill('draftDestination',dest,'destination');// OCR often reads the Roman numeral II as 11 or ll in the specific phrase Fry II.
// Only normalize the ambiguous characters in that context, never arbitrary 11 values.
scannedFeed=scannedFeed.replace(/\bFr[vy]\s*(?:11|ll|II|2)\b/gi,'Fry II');
fill('draftFeedType',scannedFeed,'feed type');
const feedField=document.getElementById('draftFeedType');
status.textContent=filled.length?'Scan complete: '+filled.join(', ')+'. Verify every field, especially the date printed on the ticket. Nothing was saved.':'Scan finished, but no reliable fields were found. Enter ticket details manually.';if(!filled.length)status.textContent='Scanner could not confidently identify ticket fields. Try a closer, well-lit picture with the ticket filling the frame.'}catch(e){status.textContent='Scanning unavailable: '+e.message+'. You can still enter the ticket manually.'}finally{busy=false;btn.disabled=false}}})();
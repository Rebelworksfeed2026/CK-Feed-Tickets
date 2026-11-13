/* C&K Feed Tickets — feed type OCR recognition (preview only).
   This stage identifies ticket wording for review; it does not save feed data. */
(()=>{'use strict';
  const labels=['Mini Pellets','FRY 2','28 Special','Dust/Fines'];
  function normalize(s){return String(s||'').toUpperCase().replace(/[–—]/g,'-').replace(/\\s+/g,' ').trim();}
  function inspect(ocrText){
    const raw=String(ocrText||'');
    const text=normalize(raw);
    let type=null;
    if(/\\b(?:DW\\s*)?28\\s*(?:SPEC(?:IAL)?|SPE?C)\\s*(?:IRON|FEED)?\\b/.test(text))type='28 Special';
    else if(/\\bFRY\\s*[- ]?2\\b/.test(text))type='FRY 2';
    else if(/\\b(?:MINI\\s*PELLETS?|PELLETS?\\s*MINI)\\b/.test(text))type='Mini Pellets';
    else if(/\\b(?:DUST\\s*[\\/ &-]?\\s*FINE?S?|FINES?\\s*DUST)\\b/.test(text))type='Dust/Fines';
    const lines=raw.split(/\\r?\\n/).map(x=>x.trim()).filter(Boolean);
    const productLines=lines.filter(x=>/\\b(?:product|feed|description|DW|delta western|mini|pellet|fry|dust|fine|spec|iron)\\b/i.test(x));
    return Object.freeze({type,known:Boolean(type),recognizedText:productLines.slice(0,5).join(' | '),raw:raw.slice(0,12000)});
  }
  function render(result){
    let panel=document.getElementById('feedRecognitionResult');
    if(!panel){
      panel=document.createElement('div');panel.id='feedRecognitionResult';
      panel.style.cssText='margin:10px 0;padding:12px;border:1px solid #b5c5d1;border-radius:8px;background:#f4f8fa';
      const anchor=document.getElementById('cameraMessage');
      if(anchor)anchor.insertAdjacentElement('afterend',panel);
    }
    if(!panel)return;
    panel.replaceChildren();
    const heading=document.createElement('strong');
    heading.textContent=result.known?'Feed type recognized':'Feed type needs review';
    panel.appendChild(heading);
    const value=document.createElement('p');
    value.style.margin='6px 0';
    value.textContent=result.known?result.type:'No supported feed name was confidently recognized. Do not guess.';
    panel.appendChild(value);
    if(result.recognizedText){
      const detail=document.createElement('small');detail.style.display='block';
      detail.textContent='Ticket wording read: '+result.recognizedText;panel.appendChild(detail);
    }
    const note=document.createElement('small');note.style.display='block';note.style.marginTop='6px';
    note.textContent='Preview only: verify against the paper ticket. Feed type is not saved to the delivery record yet.';
    panel.appendChild(note);
  }
  window.CKFeedRecognition=Object.freeze({inspect,render,labels});
})();
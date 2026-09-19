(async()=>{
  'use strict';
  const BASE='https://cdn.jsdelivr.net/gh/8k9fgd7kf7-art/ReportLootHelper@main/';
  try{
    const metaResponse=await fetch(`${BASE}latest.json?t=${Date.now()}`,{cache:'no-store'});
    if(!metaResponse.ok) throw new Error(`latest.json: HTTP ${metaResponse.status}`);
    const meta=await metaResponse.json();
    if(!meta||typeof meta.file!=='string'||!/^releases\/[a-z0-9._/-]+\.js$/i.test(meta.file)){
      throw new Error('Ungültige Versionsdatei');
    }
    const scriptResponse=await fetch(`${BASE}${meta.file}?t=${Date.now()}`,{cache:'no-store'});
    if(!scriptResponse.ok) throw new Error(`Script: HTTP ${scriptResponse.status}`);
    const source=await scriptResponse.text();
    (0,eval)(`${source}\n//# sourceURL=ReportLootHelper-${meta.version||'current'}.js`);
  }catch(error){
    console.error('[ReportLootHelper Loader]',error);
    if(window.UI&&typeof UI.ErrorMessage==='function') UI.ErrorMessage(`ReportLootHelper konnte nicht geladen werden: ${error.message}`);
    else alert(`ReportLootHelper konnte nicht geladen werden: ${error.message}`);
  }
})();

javascript:(async()=>{
  'use strict';

  const VERSION='1.0.4';
  const STORE_KEY='ds_report_loot_attack_settings_v1';
  const PANEL_ID='ds-report-loot-attack';
  const UNIT_DATA={
    spear:{name:'Speerträger',carry:25},
    sword:{name:'Schwertkämpfer',carry:15},
    axe:{name:'Axtkämpfer',carry:10},
    archer:{name:'Bogenschütze',carry:10},
    spy:{name:'Späher',carry:0},
    light:{name:'Leichte Kavallerie',carry:80},
    marcher:{name:'Berittener Bogenschütze',carry:50},
    heavy:{name:'Schwere Kavallerie',carry:50},
    ram:{name:'Rammbock',carry:0},
    catapult:{name:'Katapult',carry:0},
    knight:{name:'Paladin',carry:100}
  };
  const PRIMARY_UNITS=['spear','sword','axe','archer','light','marcher','heavy','knight'];
  const EXTRA_UNITS=['spy','spear','sword','axe','archer','light','marcher','heavy','ram','catapult','knight'];
  const DEFAULTS={primary:'light',buffer:0,extras:{spy:1}};

  if(document.getElementById(PANEL_ID)){
    document.getElementById(PANEL_ID).scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }

  const screen=(window.game_data&&game_data.screen)||new URL(location.href).searchParams.get('screen');
  const hasSingleReport=Boolean(
    document.querySelector('#report_wrapper,.report_ReportAttack,.report_ReportSpy')||
    [...document.querySelectorAll('a[href]')].some(a=>/dieses\s+dorf\s+angreifen/i.test(a.textContent||''))
  );
  if(screen!=='report'||!hasSingleReport){
    notify('Bitte das Script in einem geöffneten Einzelbericht starten.','error');
    return;
  }

  function notify(message,type='success'){
    if(window.UI&&typeof UI[type==='error'?'ErrorMessage':'SuccessMessage']==='function'){
      UI[type==='error'?'ErrorMessage':'SuccessMessage'](message);
    }else alert(message);
  }

  function loadSettings(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORE_KEY)||'{}');
      const primary=PRIMARY_UNITS.includes(saved.primary)?saved.primary:DEFAULTS.primary;
      const buffer=Number.isFinite(Number(saved.buffer))?Math.min(100,Math.max(0,Number(saved.buffer))):0;
      const extras={};
      for(const unit of EXTRA_UNITS){
        const value=Math.max(0,Math.floor(Number(saved.extras&&saved.extras[unit])||0));
        if(value) extras[unit]=value;
      }
      if(!Object.keys(saved).length) Object.assign(extras,DEFAULTS.extras);
      return {primary,buffer,extras};
    }catch(_error){
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  function saveSettings(settings){
    localStorage.setItem(STORE_KEY,JSON.stringify(settings));
  }

  function parseGameNumber(value){
    const digits=String(value||'').replace(/[^0-9]/g,'');
    return digits?Number(digits):0;
  }

  function getResourceInfo(){
    const labelPattern=/er\s*s\s*p?[aä]h\s*te\s+rohstoffe/i;
    const cells=[...document.querySelectorAll('td,th')];
    const labelCell=cells
      .filter(cell=>labelPattern.test((cell.textContent||'').replace(/\s+/g,' ').trim()))
      .sort((a,b)=>(a.textContent||'').length-(b.textContent||'').length)[0];
    const row=(labelCell&&labelCell.closest('tr'))||
      [...document.querySelectorAll('tr')].find(tr=>labelPattern.test((tr.textContent||'').replace(/\s+/g,' ')));
    if(!row) return null;
    const valueCell=(labelCell&&labelCell.nextElementSibling)||row.querySelector('td:last-child')||row;
    const numberPattern=/\d{1,3}(?:\.\d{3})+|\d+/g;
    let values=((valueCell.innerText||valueCell.textContent||'').match(numberPattern)||[])
      .map(parseGameNumber)
      .filter(value=>value>=0);
    if(values.length<3){
      values=((row.innerText||row.textContent||'').match(numberPattern)||[])
        .map(parseGameNumber)
        .filter(value=>value>=0);
    }
    if(values.length<3) return null;
    values=values.slice(0,3);
    return {wood:values[0],clay:values[1],iron:values[2],total:values.reduce((sum,value)=>sum+value,0)};
  }

  function getTarget(){
    const attackLink=[...document.querySelectorAll('a[href]')].find(a=>
      /dieses\s+dorf\s+angreifen/i.test(a.textContent||'')||
      (/screen=place/.test(a.href)&&/[?&]target=/.test(a.href))
    );
    const rows=[...document.querySelectorAll('tr')];
    const targetRow=rows.find(tr=>/^\s*ziel\s*:/i.test(tr.textContent||''));
    const coordSource=(targetRow&&targetRow.textContent)||document.body.textContent;
    const coords=coordSource.match(/(\d{1,3})\s*\|\s*(\d{1,3})/);
    if(!attackLink||!coords) return null;
    return {x:coords[1],y:coords[2],url:attackLink.href};
  }

  const resources=getResourceInfo();
  const target=getTarget();
  if(!resources){
    notify('Die erspähten Rohstoffe konnten in diesem Bericht nicht gefunden werden.','error');
    return;
  }
  if(!target){
    notify('Das Angriffsziel konnte in diesem Bericht nicht gefunden werden.','error');
    return;
  }

  const settings=loadSettings();
  const host=document.querySelector('#content_value')||document.querySelector('#contentContainer')||document.body;
  const panel=document.createElement('div');
  panel.id=PANEL_ID;
  panel.innerHTML=`
    <style>
      #${PANEL_ID}{max-width:520px;margin:10px 0;padding:0;border:1px solid #804000;background:#f4e4bc;color:#2b1a0b;font:12px Arial,sans-serif;box-shadow:0 1px 3px #6b4b24}
      #${PANEL_ID} .dsla-head{display:flex;justify-content:space-between;align-items:center;padding:7px 9px;background:linear-gradient(#c9a35e,#9d7330);color:#fff;font-weight:700}
      #${PANEL_ID} .dsla-body{padding:9px}
      #${PANEL_ID} .dsla-res{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:9px;padding:7px;background:#fff5d7;border:1px solid #d6bd83}
      #${PANEL_ID} .dsla-grid{display:grid;grid-template-columns:145px minmax(150px,1fr);gap:7px;align-items:center}
      #${PANEL_ID} select,#${PANEL_ID} input{box-sizing:border-box;width:100%;min-height:30px;border:1px solid #8c6b35;background:#fff8df;padding:4px}
      #${PANEL_ID} .dsla-extras{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin-top:8px}
      #${PANEL_ID} .dsla-extra{display:grid;grid-template-columns:1fr 58px;gap:4px;align-items:center}
      #${PANEL_ID} .dsla-result{margin:9px 0;padding:8px;border:1px solid #c9aa6b;background:#fff1c6;line-height:1.5}
      #${PANEL_ID} .dsla-actions{display:flex;gap:7px;flex-wrap:wrap}
      #${PANEL_ID} button{min-height:34px;padding:6px 12px;border:1px solid #5d3d12;border-radius:2px;background:linear-gradient(#d9bd7a,#b78a3b);color:#241400;font-weight:700;cursor:pointer}
      #${PANEL_ID} button.dsla-primary{background:linear-gradient(#79a84d,#497d25);color:#fff;border-color:#315817;flex:1}
      #${PANEL_ID} .dsla-note{margin-top:7px;color:#6b4b24;font-size:11px}
      @media(max-width:600px){#${PANEL_ID}{max-width:none}#${PANEL_ID} .dsla-grid{grid-template-columns:1fr}#${PANEL_ID} .dsla-extras{grid-template-columns:1fr 1fr}#${PANEL_ID} button{width:100%}}
    </style>
    <div class="dsla-head"><span>Plünderangriff vorbereiten</span><small>v${VERSION}</small></div>
    <div class="dsla-body">
      <div class="dsla-res">
        <span>🌲 <b>${resources.wood.toLocaleString('de-DE')}</b></span>
        <span>🧱 <b>${resources.clay.toLocaleString('de-DE')}</b></span>
        <span>⚙️ <b>${resources.iron.toLocaleString('de-DE')}</b></span>
        <span>Σ <b>${resources.total.toLocaleString('de-DE')}</b></span>
      </div>
      <div class="dsla-grid">
        <label for="dsla-primary">Haupttruppe</label>
        <select id="dsla-primary">${PRIMARY_UNITS.map(unit=>`<option value="${unit}">${UNIT_DATA[unit].name} (${UNIT_DATA[unit].carry})</option>`).join('')}</select>
        <label for="dsla-buffer">Sicherheitsaufschlag</label>
        <select id="dsla-buffer">${[0,5,10,15,20,25,50].map(value=>`<option value="${value}">${value} %</option>`).join('')}</select>
      </div>
      <div style="margin-top:9px;font-weight:700">Feste Begleittruppen</div>
      <div class="dsla-extras">${EXTRA_UNITS.map(unit=>`<label class="dsla-extra"><span>${UNIT_DATA[unit].name}</span><input type="number" min="0" step="1" inputmode="numeric" data-extra="${unit}" value="${settings.extras[unit]||0}"></label>`).join('')}</div>
      <div class="dsla-result" id="dsla-result"></div>
      <div class="dsla-actions"><button type="button" class="dsla-primary" id="dsla-prepare">Angriff vorbereiten</button><button type="button" id="dsla-close">Schließen</button></div>
      <div class="dsla-note">Das Script trägt die Einheiten ein und öffnet nur die Bestätigungsseite. Es sendet keinen Angriff ab.</div>
    </div>`;
  host.prepend(panel);

  const primarySelect=panel.querySelector('#dsla-primary');
  const bufferSelect=panel.querySelector('#dsla-buffer');
  const resultBox=panel.querySelector('#dsla-result');
  primarySelect.value=settings.primary;
  bufferSelect.value=String(settings.buffer);

  function collectSettings(){
    const extras={};
    panel.querySelectorAll('[data-extra]').forEach(input=>{
      const value=Math.max(0,Math.floor(Number(input.value)||0));
      input.value=String(value);
      if(value) extras[input.dataset.extra]=value;
    });
    return {primary:primarySelect.value,buffer:Number(bufferSelect.value)||0,extras};
  }

  function calculate(){
    const current=collectSettings();
    const wanted=Math.ceil(resources.total*(1+current.buffer/100));
    let extraCapacity=0;
    for(const [unit,amount] of Object.entries(current.extras)) extraCapacity+=(UNIT_DATA[unit]?.carry||0)*amount;
    const mainCapacity=UNIT_DATA[current.primary].carry;
    const mainAmount=Math.max(0,Math.ceil((wanted-extraCapacity)/mainCapacity));
    const troops={...current.extras};
    troops[current.primary]=(troops[current.primary]||0)+mainAmount;
    const totalCapacity=Object.entries(troops).reduce((sum,[unit,amount])=>sum+(UNIT_DATA[unit]?.carry||0)*amount,0);
    return {settings:current,wanted,mainAmount,troops,totalCapacity};
  }

  function render(){
    const calc=calculate();
    saveSettings(calc.settings);
    const troopText=Object.entries(calc.troops).filter(([,amount])=>amount>0).map(([unit,amount])=>`${amount.toLocaleString('de-DE')} ${UNIT_DATA[unit].name}`).join(', ');
    resultBox.innerHTML=`<b>${troopText||'Keine Truppen ausgewählt'}</b><br>Tragkraft: ${calc.totalCapacity.toLocaleString('de-DE')} für ${calc.wanted.toLocaleString('de-DE')} eingeplante Rohstoffe`;
  }

  panel.addEventListener('input',render);
  panel.addEventListener('change',render);
  panel.querySelector('#dsla-close').addEventListener('click',()=>panel.remove());

  panel.querySelector('#dsla-prepare').addEventListener('click',async event=>{
    event.preventDefault();
    const button=event.currentTarget;
    const calc=calculate();
    if(!Object.values(calc.troops).some(value=>value>0)){
      notify('Bitte mindestens eine Einheit auswählen.','error');
      return;
    }
    saveSettings(calc.settings);
    button.disabled=true;
    button.textContent='Angriffsmaske wird geladen …';
    try{
      const response=await fetch(target.url,{credentials:'same-origin'});
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const html=await response.text();
      const parsed=new DOMParser().parseFromString(html,'text/html');
      const sourceForm=parsed.querySelector('#command-data-form,form[action*="try=confirm"]');
      if(!sourceForm) throw new Error('Angriffsformular nicht gefunden');
      const submitForm=document.createElement('form');
      submitForm.method=(sourceForm.method||'post').toLowerCase();
      submitForm.action=new URL(sourceForm.getAttribute('action')||target.url,target.url).href;
      submitForm.style.display='none';
      sourceForm.querySelectorAll('input[type="hidden"]').forEach(input=>{
        const clone=input.cloneNode(true);
        submitForm.appendChild(clone);
      });
      const add=(name,value)=>{
        let input=submitForm.querySelector(`input[name="${CSS.escape(name)}"]`);
        if(!input){input=document.createElement('input');input.type='hidden';input.name=name;submitForm.appendChild(input);}
        input.value=String(value);
      };
      add('x',target.x);
      add('y',target.y);
      for(const [unit,amount] of Object.entries(calc.troops)) if(amount>0) add(unit,amount);
      add('attack','Angreifen');
      document.body.appendChild(submitForm);
      submitForm.submit();
    }catch(error){
      console.error('[Plünderangriff]',error);
      button.disabled=false;
      button.textContent='Angriff vorbereiten';
      notify(`Angriff konnte nicht vorbereitet werden: ${error.message}`,'error');
    }
  });

  render();
  panel.scrollIntoView({behavior:'smooth',block:'center'});
})();

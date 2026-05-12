function initFormSteps(){
  const steps=[...document.querySelectorAll('.form-step')];
  const form=document.querySelector('[data-fls-form]');
  if(!form||!steps.length)return;
  let current=0,isAnimating=false;
  const storageKey='clinicselect_form',maxAge=10080*60*1000;
  const getChecked=(name)=>form.querySelector(`input[name="${name}"]:checked`);
  const getCheckedAll=(name)=>[...form.querySelectorAll(`input[name="${name}"]:checked`)];
  function save(){
    const fields={};
    ['form[treatment]','form[location]','form[date]','form[budget]'].forEach(name=>{const el=getChecked(name);if(el)fields[name]=el.value;});
    const pr=getCheckedAll('form[priority][]').map(el=>el.value);if(pr.length)fields['form[priority][]']=pr;
    ['name','phone','email'].forEach(id=>{const el=document.getElementById(id);if(el)fields[`form[${id}]`]=el.value;});
    const consent=document.getElementById('privacy-consent'); if(consent)fields['form[privacy_consent]']=consent.checked?'1':'';
    try{localStorage.setItem(storageKey,JSON.stringify({step:current,fields,savedAt:Date.now()}));}catch(e){}
  }
  function clearSave(){try{localStorage.removeItem(storageKey);}catch(e){}}
  function load(){try{const raw=localStorage.getItem(storageKey);if(!raw)return null;const data=JSON.parse(raw);if(!data.savedAt||Date.now()-data.savedAt>maxAge){clearSave();return null;}return data;}catch(e){return null;}}
  function show(dir='none'){
    steps.forEach((step,i)=>{if(i===current){step.classList.remove('_step-hidden'); if(dir==='forward'){step.classList.add('_step-entering');step.addEventListener('animationend',()=>step.classList.remove('_step-entering'),{once:true});} if(dir==='back'){step.classList.add('_step-entering-back');step.addEventListener('animationend',()=>step.classList.remove('_step-entering-back'),{once:true});}}else{step.classList.remove('_step-entering','_step-entering-back','_step-exiting','_step-exiting-back');step.classList.add('_step-hidden');}});
  }
  function isValid(step){
    const id=step.id;
    if(id==='form-step-1')return !!step.querySelector('input[name="form[treatment]"]:checked');
    if(id==='form-step-2')return step.querySelectorAll('input[name="form[priority][]"]:checked').length>0;
    if(id==='form-step-3')return !!step.querySelector('input[name="form[location]"]:checked');
    if(id==='form-step-4')return !!step.querySelector('input[name="form[date]"]:checked')&&!!step.querySelector('input[name="form[budget]"]:checked');
    if(id==='form-step-5'){
      const n=document.getElementById('name'),e=document.getElementById('email'),p=document.getElementById('privacy-consent');
      return n&&/[a-zA-ZÀ-ÿА-яҐЄІЇа-яґєії]/.test(n.value.trim()) && e&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim()) && p&&p.checked;
    }
    return true;
  }
  function update(step){
    const btn=step.querySelector('.button-next'); if(!btn)return;
    if(btn.type==='submit' || step.id==='form-step-5'){
      btn.classList.remove('_not-active');
      btn.disabled=false;
    } else {
      btn.classList.toggle('_not-active',!isValid(step));
    }
    if(step.id==='form-step-2'){
      const span=btn.querySelector('span');
      if(span)span.textContent=step.querySelectorAll('input[name="form[priority][]"]:checked').length===2?'Weiter zum nächsten Schritt':'Weiter zum nächsten Schritt';
    }
  }
  const saved=load();
  if(saved){
    Object.entries(saved.fields||{}).forEach(([name,val])=>{
      if(Array.isArray(val)) val.forEach(v=>{const el=form.querySelector(`input[name="${name}"][value="${CSS.escape(v)}"]`);if(el)el.checked=true;});
      else {const el=form.querySelector(`input[name="${name}"][value="${CSS.escape(val)}"]`); if(el)el.checked=true;}
    });
    ['name','phone','email'].forEach(id=>{const el=document.getElementById(id); if(el&&saved.fields[`form[${id}]`]){el.value=saved.fields[`form[${id}]`]; const wrap=el.closest('.form-body__item'); if(wrap)wrap.classList.add('--form-success');}});
    const consent=document.getElementById('privacy-consent'); if(consent&&saved.fields['form[privacy_consent]']==='1')consent.checked=true;
    if(typeof saved.step==='number'&&saved.step>=0&&saved.step<steps.length)current=saved.step;
  }
  steps.forEach((step)=>{
    const next=step.querySelector('.button-next'),prev=step.querySelector('.button-prev');
    if(next)next.addEventListener('click',(ev)=>{if(next.classList.contains('_not-active')){ev.preventDefault();return;} if(next.type!=='submit'&&!isAnimating&&current<steps.length-1){isAnimating=true;steps[current].classList.add('_step-exiting');setTimeout(()=>{current++;show('forward');save();isAnimating=false;},290);}});
    if(prev)prev.addEventListener('click',()=>{if(current>0&&!isAnimating){isAnimating=true;steps[current].classList.add('_step-exiting-back');setTimeout(()=>{current--;show('back');save();isAnimating=false;},290);}});
    step.addEventListener('input',()=>{update(step);save();});
    step.addEventListener('change',()=>{update(step);save();});
    update(step);
  });
  const priorityStep=document.getElementById('form-step-2');
  if(priorityStep){
    priorityStep.querySelectorAll('input[name="form[priority][]"]').forEach(input=>{
      input.addEventListener('click',function(e){
        const checked=priorityStep.querySelectorAll('input[name="form[priority][]"]:checked');
        if(this.checked&&checked.length>2){
          this.checked=false;
          const body=priorityStep.querySelector('.form-body');
          body&&body.classList.remove('option-limit-shake');
          void (body&&body.offsetWidth);
          body&&body.classList.add('option-limit-shake');
        }
        update(priorityStep);save();
      });
    });
  }
  const phone=document.getElementById('phone'); if(phone)phone.addEventListener('input',e=>{e.target.value=e.target.value.replace(/[^\d+()\-\s]/g,'')});
  show();
}
window.addEventListener('load',()=>setTimeout(initFormSteps,0));

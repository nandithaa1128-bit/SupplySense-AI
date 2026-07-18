/* ========================================================
   STATE
======================================================== */
console.log("SCRIPT STARTED");
const state = {
  houseNumber:"", name:"", phone:"", locality:"",
  familySize:"", dietType:"", meatDays:[],
  vegetables:[], fruits:[], grains:[],
  riceTypes:[], dairy:[],
  dailyRice:"", monthlyRice:"", weeklyMilk:"",
  grocerySource:[], vegFreq:"", groceryFreq:""
};

const OPTIONS = {
  vegetables:["Onion","Tomato","Carrot","Potato","Brinjal","Beans","Cauliflower","Cabbage","Okra","Drumstick","Chilli","Bitter Gourd","Ridge Gourd","Snake Gourd","Bottle Gourd","Cucumber","Beetroot","Radish","Ash Gourd","Cluster Beans","Field Beans (Avarekai)","Pumpkin","Spinach (Palak)","Methi Leaves","Coriander Leaves","Curry Leaves","Raw Banana","Yam","Colocasia","Capsicum","Green Peas","Tindora"],
  fruits:["Banana","Apple","Orange","Papaya","Grapes","Watermelon","Pomegranate","Guava","Mango","Jackfruit","Sapota (Chikoo)","Pineapple","Sweet Lime (Mosambi)","Custard Apple","Fig","Muskmelon","Tender Coconut"],
  grains:["Rice","Jawar","Millets","Ragi","Wheat","Maize","Barley","Sorghum"],
  riceTypes:["White Rice","Sona Masuri","Madhusanna","Jeerige Sanna","Red rice/Rajamudi","Basmati","Idli/Dosa Rice","Brown rice","Black rice"],
  dairy:["Milk","Curd","Paneer","Buttermilk","Ice Cream"],
  days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
  dailyRice:["<0.5 kg","0.5 kg","0.5 kg - 1 kg","1 kg - 2 kg","More than 2 kg"],
  monthlyRice:["3-6 kg","6-10 kg","10-14 kg","14-18 kg","18-22 kg",">22 kg"],
  weeklyMilk:["<1L","1-3L","3-5L","5-7L",">7L"],
  source:["Local kirana stores","KR Market","Gandhi Bazaar","LuLu Daily","METRO","More Mega Store","Reliance","D mart","Blinkit","Swiggy Instamart","Zepto","Big Basket"],
  freq:["Daily","Weekly","Biweekly(Twice a week)","Semiweekly","Monthly"]
};

/* ====================================================
   NAV / PROGRESS
======================================================== */
const STEP_SCREENS = ["scr-2","scr-3","scr-4","scr-5","scr-6","scr-7"];

function renderStalk(){
  document.querySelectorAll('[id^="stalk-wrap"]').forEach(wrap=>{
    const screenIdMatch = wrap.id === "stalk-wrap" ? "scr-2" : "scr-"+wrap.id.split("-")[2];
    const idx = STEP_SCREENS.indexOf(screenIdMatch);
    wrap.innerHTML = "";
    const line = document.createElement('div');
    line.className = 'stalk-line';
    const fill = document.createElement('div');
    fill.className = 'stalk-fill';
    fill.style.width = (idx/(STEP_SCREENS.length-1)*100)+"%";
    line.appendChild(fill);
    wrap.appendChild(line);
  });
}

function goTo(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0,behavior:"smooth"});
  if(id === "scr-7"){
    renderResult();
  }
  if(id === "scr-dashboard") renderDashboard();
  renderStalk();
}

function resetApp(){
  Object.assign(state,{
    houseNumber:"",name:"",phone:"",locality:"",familySize:"",dietType:"",meatDays:[],
    vegetables:[],fruits:[],grains:[],riceTypes:[],dairy:[],dailyRice:"",monthlyRice:"",weeklyMilk:"",
    grocerySource:"",vegFreq:"",groceryFreq:""
  });
  document.getElementById('f-house').value="";
  document.getElementById('f-name').value="";
  document.getElementById('f-phone').value="";
  document.getElementById('f-locality').value="";
  buildAllUI();
  
  goTo('scr-welcome');
}

function toast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove('show'), 2200);
}

/* ========================================================
   WELCOME / IDENTITY
======================================================== */
document.getElementById('btn-get-started').addEventListener('click', ()=> goTo('scr-identity'));
document.getElementById('btn-admin-login').addEventListener('click', ()=> goTo('scr-admin-login'));

document.getElementById('btn-continue-identity').addEventListener('click', ()=>{
  const house = document.getElementById('f-house').value.trim();
  const name = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const locality = document.getElementById('f-locality').value.trim();
  if(!name || !phone || !locality){
    toast("Please fill in name, phone and locality to continue.");
    document.getElementById('identity-fields').classList.add('shake');
    setTimeout(()=>document.getElementById('identity-fields').classList.remove('shake'),350);
    return;
  }
  if(!/^\d{10}$/.test(phone)){
    toast("Enter a valid 10-digit phone number.");
    return;
  }
  state.houseNumber = house; state.name = name; state.phone = phone; state.locality = locality;
  goTo('scr-2');
});

/* ========================================================
   BUILDERS: pills / radios / checkboxes
======================================================== */
function buildPillGroup(containerId, list, stateKey, maxCount){
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  list.forEach(item=>{
    const pill = document.createElement('button');
    pill.className = 'pill';
    pill.type = 'button';
    pill.appendChild(document.createTextNode(item));
    pill.addEventListener('click', ()=>{
      const arr = state[stateKey];
      const i = arr.indexOf(item);
      if(i > -1){
        arr.splice(i,1);
      } else {
        if(maxCount && arr.length >= maxCount){
          toast("You can select up to "+maxCount+" only.");
          pill.classList.add('shake');
          setTimeout(()=>pill.classList.remove('shake'),350);
          return;
        }
        arr.push(item);
      }
      refreshPillGroup(containerId, stateKey);
      onGrainOrDietChange();
    });
    el.appendChild(pill);
  });
  refreshPillGroup(containerId, stateKey);
}

function refreshPillGroup(containerId, stateKey){
  const el = document.getElementById(containerId);
  const arr = state[stateKey];
  [...el.children].forEach(pill=>{
    pill.classList.toggle('selected', arr.includes(pill.textContent));
  });
  if(containerId === 'veg-grid') document.getElementById('veg-count').textContent = arr.length;
  if(containerId === 'fruit-grid') document.getElementById('fruit-count').textContent = arr.length;
}

function buildRadioGroup(containerId, list, stateKey, onChange){
  const el = document.getElementById(containerId);
  el.innerHTML = "";
  list.forEach(item=>{
    const row = document.createElement('div');
    row.className = 'radio-opt';
    const dot = document.createElement('div');
    dot.className = 'radio-dot';
    const span = document.createElement('span');
    span.appendChild(document.createTextNode(item));
    row.appendChild(dot);
    row.appendChild(span);
    row.addEventListener('click', ()=>{
      state[stateKey] = item;
      [...el.children].forEach(r=>r.classList.remove('selected'));
      row.classList.add('selected');
      if(onChange) onChange();
    });
    el.appendChild(row);
  });
}
function buildCheckboxGroup(containerId, list, stateKey){
  const el = document.getElementById(containerId);
  el.innerHTML = "";

  list.forEach(item=>{
    const row = document.createElement("div");
    row.className = "radio-opt";
    const dot = document.createElement("div");
    dot.className = "radio-dot";
    const span = document.createElement("span");
    span.appendChild(document.createTextNode(item));
    row.appendChild(dot);
    row.appendChild(span);

    row.addEventListener("click", ()=>{

      const arr = state[stateKey];
      const index = arr.indexOf(item);

      if(index > -1){
        arr.splice(index,1);
      }else{
        arr.push(item);
      }

      [...el.children].forEach(child=>{
        const value = child.querySelector("span").innerText;
        child.classList.toggle(
          "selected",
          arr.includes(value)
        );
      });

    });

    el.appendChild(row);
  });
}

function buildDayGrid(){
  const el = document.getElementById('day-grid');
  el.innerHTML = "";
  OPTIONS.days.forEach(day=>{
    const d = document.createElement('div');
    d.className = 'day-pill';
    d.appendChild(document.createTextNode(day));
    d.addEventListener('click', ()=>{
      const i = state.meatDays.indexOf(day);
      if(i>-1) state.meatDays.splice(i,1); else state.meatDays.push(day);
      d.classList.toggle('selected');
    });
    el.appendChild(d);
  });
}

/* ========================================================
   SCREEN 2: household
======================================================== */
document.getElementById('f-family').addEventListener('change', e=> state.familySize = e.target.value);
document.getElementById('f-diet').addEventListener('change', e=>{
  state.dietType = e.target.value;
  document.getElementById('meat-days-group').classList.toggle('hidden', e.target.value !== 'Non Vegetarian');
});
document.getElementById('btn-s2-next').addEventListener('click', ()=>{
  if(!state.familySize || !state.dietType){
    toast("Please select family size and diet type.");
    return;
  }
  goTo('scr-3');
});

/* ========================================================
   SCREEN 3: produce & grains
======================================================== */
function onGrainOrDietChange(){
  const showRice = state.grains.includes("Rice");
  document.getElementById("rice-type-title").classList.toggle("hidden", !showRice);
  document.getElementById("rice-type-grid").style.display = showRice ? "flex" : "none";
}
document.getElementById('btn-s3-next').addEventListener('click', ()=>{
  if(state.vegetables.length === 0 || state.fruits.length === 0 || state.grains.length === 0){
    toast("Pick at least one item from each category.");
    return;
  }
  goTo('scr-4');
});

/* ========================================================
   SCREEN 5: quantitative
======================================================== */
document.getElementById('btn-s5-next').addEventListener('click', ()=>{
  if(!state.dailyRice || !state.monthlyRice || !state.weeklyMilk){
    toast("Please answer all three questions to continue.");
    return;
  }
  goTo('scr-6');
});

/* ========================================================
   SCREEN 6: purchasing & API prediction integration
======================================================== */
const btn = document.getElementById("btn-s6-next");
console.log(btn);
btn.onclick = async function(e){
  e.preventDefault();
  console.log("BUTTON CLICKED");

  if (
    state.grocerySource.length === 0 ||
    !state.vegFreq ||
    !state.groceryFreq
) {
    toast("Please complete all purchasing questions.");
    return;
}

  toast("Generating AI prediction...");

  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state)
    });

    const prediction = await response.json();
    const consumption = prediction.consumption;

    // Update basic consumption details
    document.getElementById("res-monthly-rice").innerText = consumption.rice_per_month.toFixed(2) + " kg";
    document.getElementById("res-weekly-milk").innerText = consumption.milk_per_week.toFixed(2) + " L";
    document.getElementById("res-grocery-freq").innerText = consumption.grocery_frequency;
    document.getElementById("res-veg-freq").innerText = consumption.vegetable_frequency;

    const zone = prediction.zone;
    let supplier = "Not Available";
    let warehouse = "Not Available";
    let eta = "Not Available";
    let status = "Optimized";

    // Parse Inventory Allocations
    const inventory = prediction.inventory[zone];
    outer:
    for (const category in inventory) {
      for (const product in inventory[category]) {
        const allocations = inventory[category][product].allocated;
        if (allocations && allocations.length > 0) {
          supplier = allocations[0].supplier;
          warehouse = allocations[0].warehouse;
          break outer;
        }
      }
    }

    // Parse Delivery Allocations
    const delivery = prediction.delivery[zone];
    outer2:
    for (const category in delivery) {
      for (const product in delivery[category]) {
        const deliveries = delivery[category][product];
        if (Array.isArray(deliveries) && deliveries.length > 0) {
          eta = deliveries[0].estimated_delivery;
          status = deliveries[0].status;
          break outer2;
        }
      }
    }

    // Update UI elements with inventory/delivery assignments
    document.getElementById("res-supplier").innerText = supplier;
    document.getElementById("res-warehouse").innerText = warehouse;
    document.getElementById("res-eta").innerText = eta;
    document.getElementById("res-status").innerText = status;

    // Persist prediction response globally to application state
    state.prediction = prediction;

    // Move into results display view
    goTo("scr-7");

  } catch (err) {
    console.error(err);
    toast("Backend not running!");
  }
};

/* ========================================================
   BUILD ALL UI (called once)
======================================================== */
function buildAllUI(){
  buildDayGrid();
  buildPillGroup('veg-grid', OPTIONS.vegetables, 'vegetables');
  buildPillGroup('fruit-grid', OPTIONS.fruits, 'fruits');
  buildPillGroup('grain-grid', OPTIONS.grains, 'grains', null);
  buildPillGroup('rice-type-grid', OPTIONS.riceTypes, 'riceTypes', null);
  buildPillGroup('dairy-grid', OPTIONS.dairy, 'dairy', null);
  buildRadioGroup('daily-rice-list', OPTIONS.dailyRice, 'dailyRice');
  buildRadioGroup('monthly-rice-list', OPTIONS.monthlyRice, 'monthlyRice');
  buildRadioGroup('weekly-milk-list', OPTIONS.weeklyMilk, 'weeklyMilk');
  buildCheckboxGroup('source-list', OPTIONS.source, 'grocerySource');
  buildRadioGroup('veg-freq-list', OPTIONS.freq, 'vegFreq');
  buildRadioGroup('grocery-freq-list', OPTIONS.freq, 'groceryFreq');
  onGrainOrDietChange();
  renderStalk();
}
buildAllUI();

/* ========================================================
   RESULT SCREEN (Screen 7)
======================================================== */
function renderResult(){
  const summary = document.getElementById('summary-card');
  summary.innerHTML = "";
  const rows = [
    ['Locality', state.locality || '—'],
    ['Family size', state.familySize || '—'],
    ['Diet type', state.dietType || '—'],
    ['Vegetables', state.vegetables.join(', ') || '—'],
    ['Fruits', state.fruits.join(', ') || '—'],
    ['Grains', state.grains.join(', ') || '—'],
    ['Dairy', state.dairy.join(', ') || '—'],
    ['Primary source', state.grocerySource.length ? state.grocerySource.join(", ") : "—"]
  ];
  rows.forEach(([label, val])=>{
    const rowDiv = document.createElement('div');
    rowDiv.className = 'summary-row';
    const labelSpan = document.createElement('span');
    labelSpan.appendChild(document.createTextNode(label));
    const valSpan = document.createElement('span');
    valSpan.appendChild(document.createTextNode(val));
    rowDiv.appendChild(labelSpan);
    rowDiv.appendChild(valSpan);
    summary.appendChild(rowDiv);
  });
}

/* ========================================================
   ADMIN LOGIN
======================================================== */
document.getElementById('btn-admin-submit').addEventListener('click', ()=>{
  const u = document.getElementById('admin-user').value.trim();
  const p = document.getElementById('admin-pass').value.trim();
  const err = document.getElementById('admin-err');
  if(u === 'admin123' && p === 'admin123'){
    err.classList.remove('show');
    goTo('scr-dashboard');
  } else {
    err.classList.add('show');
  }
});

/* ========================================================
   ADMIN DASHBOARD
======================================================== */
function statusFor(inv, dem){
  const ratio = inv/dem;
  if(ratio >= 1) return {label:"Healthy", cls:"ok"};
  if(ratio >= 0.8) return {label:"Low stock", cls:"low"};
  return {label:"Critical", cls:"critical"};
}

function toggleLocalities(id){
  const row = document.getElementById(id);
  if(row) row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
}

async function renderDashboard(){
  let localities = [];

  try {
    const response = await fetch("http://127.0.0.1:8000/inventory-status");
    const data = await response.json();
    if(data.status === "success"){
      localities = data.localities || [];
    }
  } catch(err) {
    console.error("Failed to load inventory status:", err);
  }

  if(state.locality && state.locality !== 'Other'){
    const match = localities.find(l=>l.name === state.locality);
    if(match){ match.demandRice += 8; match.demandMilk += 5; }
  }

  const totalHouseholds = 118 + (state.name ? 1 : 0);
  const aggRice = localities.reduce((s,l)=>s+l.demandRice,0);
  const aggMilk = localities.reduce((s,l)=>s+l.demandMilk,0);
  const alerts = localities.filter(l => l.inventoryRice/l.demandRice < 0.9 || l.inventoryMilk/l.demandMilk < 0.9);

  document.getElementById('kpi-grid').innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">Active households</div>
      <div class="kpi-value">${totalHouseholds}</div>
      <div class="kpi-delta">+${state.name ? 1 : 0} today</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Aggregate rice demand</div>
      <div class="kpi-value">${aggRice.toLocaleString()} kg</div>
      <div class="kpi-delta">across ${localities.length} zones</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Aggregate milk demand</div>
      <div class="kpi-value">${aggMilk.toLocaleString()} L</div>
      <div class="kpi-delta">weekly rolling</div>
    </div>
    <div class="kpi-card alert">
      <div class="kpi-label">Active alerts</div>
      <div class="kpi-value">${alerts.length}</div>
      <div class="kpi-delta">needs attention</div>
    </div>
  `;

  // Zone-wise table with expandable locality rows
  const table = document.getElementById('demand-table');
  let rows = `<tr><th>Zone</th><th>Rice (inv / dem)</th><th>Milk (inv / dem)</th><th>Status</th></tr>`;
  localities.forEach(l=>{
    const riceStatus = statusFor(l.inventoryRice, l.demandRice);
    const milkStatus = statusFor(l.inventoryMilk, l.demandMilk);
    const worst = riceStatus.cls === 'critical' || milkStatus.cls === 'critical' ? {label:"Critical",cls:"critical"}
      : (riceStatus.cls === 'low' || milkStatus.cls === 'low') ? {label:"Low stock",cls:"low"} : {label:"Healthy",cls:"ok"};
    const zoneId = 'zone-'+l.name;
    rows += `<tr class="zone-row" onclick="toggleLocalities('${zoneId}')" style="cursor:pointer;">
      <td>▶ ${l.name}</td>
      <td>${l.inventoryRice} / ${l.demandRice} kg</td>
      <td>${l.inventoryMilk} / ${l.demandMilk} L</td>
      <td><span class="status-chip ${worst.cls}">${worst.label}</span></td>
    </tr>`;
    if(l.localities && l.localities.length > 0){
      rows += `<tr id="${zoneId}" style="display:none;"><td colspan="4" style="padding:0;">`;
      rows += `<table style="width:100%;border-collapse:collapse;background:#f9f9f6;">`;
      rows += `<tr style="font-size:12px;color:#666;"><th style="padding:6px 12px;text-align:left;">Locality</th><th style="padding:6px 12px;">Households</th><th style="padding:6px 12px;">Rice demand (monthly)</th><th style="padding:6px 12px;">Milk demand (weekly)</th></tr>`;
      l.localities.forEach(loc=>{
        rows += `<tr style="font-size:13px;"><td style="padding:5px 12px;">${loc.name}</td><td style="padding:5px 12px;text-align:center;">${loc.households}</td><td style="padding:5px 12px;text-align:center;">${loc.demandRice} kg</td><td style="padding:5px 12px;text-align:center;">${loc.demandMilk} L</td></tr>`;
      });
      rows += `</table></td></tr>`;
    }
  });
  table.innerHTML = rows;

  const alertsList = document.getElementById('alerts-list');
  if(alerts.length === 0){
    alertsList.innerHTML = `<div class="alert-card"><div><div class="a-title">All zones within safe inventory range</div><div class="a-sub">No action needed right now.</div></div></div>`;
  } else {
    alertsList.innerHTML = alerts.map(l=>{
      const riceGap = l.demandRice - l.inventoryRice;
      const milkGap = l.demandMilk - l.inventoryMilk;
      const critical = (l.inventoryRice/l.demandRice < 0.75) || (l.inventoryMilk/l.demandMilk < 0.75);
      let msg = [];
      if(riceGap > 0) msg.push(`Need additional ${riceGap}kg rice`);
      if(milkGap > 0) msg.push(`Need additional ${milkGap}L milk`);
      return `<div class="alert-card ${critical ? 'critical':''}">
        <div>
          <div class="a-title">${critical ? '⚠️ Shortage warning' : '◈ Watch list'}: ${l.name}</div>
          <div class="a-sub">${msg.join(' · ')}</div>
        </div>
      </div>`;
    }).join('');
  }
}
console.log("SCRIPT Finished");
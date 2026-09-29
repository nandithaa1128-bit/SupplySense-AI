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
  grocerySource:"", vegFreq:"", groceryFreq:""
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
    pill.textContent = item;
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
    row.innerHTML = '<div class="radio-dot"></div><span>'+item+'</span>';
    row.addEventListener('click', ()=>{
      state[stateKey] = item;
      [...el.children].forEach(r=>r.classList.remove('selected'));
      row.classList.add('selected');
      if(onChange) onChange();
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
    d.textContent = day;
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

  if (!state.grocerySource || !state.vegFreq || !state.groceryFreq) {
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
  buildPillGroup('veg-grid', OPTIONS.vegetables, 'vegetables', 6);
  buildPillGroup('fruit-grid', OPTIONS.fruits, 'fruits', 5);
  buildPillGroup('grain-grid', OPTIONS.grains, 'grains', null);
  buildPillGroup('rice-type-grid', OPTIONS.riceTypes, 'riceTypes', null);
  buildPillGroup('dairy-grid', OPTIONS.dairy, 'dairy', null);
  buildRadioGroup('daily-rice-list', OPTIONS.dailyRice, 'dailyRice');
  buildRadioGroup('monthly-rice-list', OPTIONS.monthlyRice, 'monthlyRice');
  buildRadioGroup('weekly-milk-list', OPTIONS.weeklyMilk, 'weeklyMilk');
  buildRadioGroup('source-list', OPTIONS.source, 'grocerySource');
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
  summary.innerHTML = [
    row('Locality', state.locality || '—'),
    row('Family size', state.familySize || '—'),
    row('Diet type', state.dietType || '—'),
    row('Vegetables', state.vegetables.join(', ') || '—'),
    row('Fruits', state.fruits.join(', ') || '—'),
    row('Grains', state.grains.join(', ') || '—'),
    row('Dairy', state.dairy.join(', ') || '—'),
    row('Primary source', state.grocerySource || '—')
  ].join('');
}
function row(label,val){
  return '<div class="summary-row"><span>'+label+'</span><span>'+val+'</span></div>';
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
  if(dem <= 0) return {label:"Healthy", cls:"ok"};

  const ratio = inv / dem;

  if(ratio >= 1) return {label:"Healthy", cls:"ok"};
  if(ratio >= 0.8) return {label:"Low stock", cls:"low"};

  return {label:"Critical", cls:"critical"};
}


function getZoneStatus(zone){

  const riceStatus = statusFor(
    Number(zone.inventoryRice || 0),
    Number(zone.demandRice || 0)
  );

  const milkStatus = statusFor(
    Number(zone.inventoryMilk || 0),
    Number(zone.demandMilk || 0)
  );

  if(
    riceStatus.label === "Critical" ||
    milkStatus.label === "Critical"
  ){
    return {
      label:"Critical",
      cls:"critical"
    };
  }

  if(
    riceStatus.label === "Low stock" ||
    milkStatus.label === "Low stock"
  ){
    return {
      label:"Low stock",
      cls:"low"
    };
  }

  return {
    label:"Healthy",
    cls:"ok"
  };
}


/* ========================================================
   LOAD LIVE ADMIN DASHBOARD DATA
======================================================== */

async function renderDashboard(){

  const kpiGrid =
    document.getElementById("kpi-grid");

  const table =
    document.getElementById("demand-table");

  const alertsList =
    document.getElementById("alerts-list");


  if(!kpiGrid || !table || !alertsList){

    console.error(
      "Admin dashboard elements not found."
    );

    return;
  }


  /* -------------------------------------------------------
     LOADING STATE
  ------------------------------------------------------- */

  kpiGrid.innerHTML = `

    <div class="kpi-card">

      <div class="kpi-label">
        Loading dashboard
      </div>

      <div class="kpi-value">
        ...
      </div>

      <div class="kpi-delta">
        Fetching live backend data
      </div>

    </div>

  `;


  table.innerHTML = `

    <tbody>

      <tr>

        <td colspan="7">
          Loading live inventory and demand data...
        </td>

      </tr>

    </tbody>

  `;


  alertsList.innerHTML = "";


  try{

    /* -------------------------------------------------------
       GET DATA FROM FASTAPI BACKEND
    ------------------------------------------------------- */

    const response = await fetch(
      "http://127.0.0.1:8000/inventory-status"
    );


    if(!response.ok){

      throw new Error(
        `Backend returned HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    if(data.status !== "success"){

      throw new Error(
        data.message ||
        "Inventory API returned an error."
      );

    }


    const zones =
      Array.isArray(data.zones)
        ? data.zones
        : [];


    /* -------------------------------------------------------
       NO DATA
    ------------------------------------------------------- */

    if(zones.length === 0){

      kpiGrid.innerHTML = "";


      table.innerHTML = `

        <tbody>

          <tr>

            <td colspan="7">

              No inventory data is available.

            </td>

          </tr>

        </tbody>

      `;


      alertsList.innerHTML = `

        <div class="alert-item">

          <strong>
            No dashboard data available.
          </strong>

          <p>
            The backend returned an empty zone list.
          </p>

        </div>

      `;


      return;

    }


    /* =======================================================
       KPI TOTALS
    ======================================================= */

    const totalHouseholds =
      zones.reduce(
        (sum, zone) =>
          sum + Number(
            zone.households || 0
          ),
        0
      );


    const totalRiceDemand =
      zones.reduce(
        (sum, zone) =>
          sum + Number(
            zone.demandRice || 0
          ),
        0
      );


    const totalMilkDemand =
      zones.reduce(
        (sum, zone) =>
          sum + Number(
            zone.demandMilk || 0
          ),
        0
      );


    const totalLocalities =
      zones.reduce(
        (sum, zone) => {

          const count =
            Array.isArray(zone.localities)
              ? zone.localities.length
              : 0;

          return sum + count;

        },
        0
      );


    const alertZones =
      zones.filter(
        zone =>
          getZoneStatus(zone).label !== "Healthy"
      );


    /* =======================================================
       KPI CARDS
    ======================================================= */

    kpiGrid.innerHTML = `

      <div class="kpi-card">

        <div class="kpi-label">
          Active households
        </div>

        <div class="kpi-value">
          ${totalHouseholds}
        </div>

        <div class="kpi-delta">
          across ${zones.length} zones
        </div>

      </div>


      <div class="kpi-card">

        <div class="kpi-label">
          Aggregate rice demand
        </div>

        <div class="kpi-value">

          ${totalRiceDemand.toLocaleString(
            undefined,
            {
              maximumFractionDigits:2
            }
          )}

          kg

        </div>

        <div class="kpi-delta">
          across ${totalLocalities} localities
        </div>

      </div>


      <div class="kpi-card">

        <div class="kpi-label">
          Aggregate milk demand
        </div>

        <div class="kpi-value">

          ${totalMilkDemand.toLocaleString(
            undefined,
            {
              maximumFractionDigits:2
            }
          )}

          L

        </div>

        <div class="kpi-delta">
          predicted requirement
        </div>

      </div>


      <div class="kpi-card">

        <div class="kpi-label">
          Inventory alerts
        </div>

        <div class="kpi-value">
          ${alertZones.length}
        </div>

        <div class="kpi-delta">
          zones need attention
        </div>

      </div>

    `;


    /* =======================================================
       ZONE + LOCALITY TABLE
    ======================================================= */

    let tableHTML = `

      <thead>

        <tr>

          <th>
            Zone / Locality
          </th>

          <th>
            Households
          </th>

          <th>
            Rice inventory
          </th>

          <th>
            Rice demand
          </th>

          <th>
            Milk inventory
          </th>

          <th>
            Milk demand
          </th>

          <th>
            Status
          </th>

        </tr>

      </thead>


      <tbody>

    `;


    zones.forEach(
      (zone, zoneIndex) => {

        const zoneStatus =
          getZoneStatus(zone);


        const localities =
          Array.isArray(zone.localities)
            ? zone.localities
            : [];


        /* ---------------------------------------------------
           ZONE ROW
        --------------------------------------------------- */

        tableHTML += `

          <tr

            class="zone-row"

            onclick="
              toggleZoneRows(${zoneIndex})
            "

            style="cursor:pointer;"

          >

            <td>

              <span

                id="
                  zone-arrow-${zoneIndex}
                "

                style="
                  display:inline-block;
                  width:20px;
                "

              >
                ▶
              </span>


              <strong>
                ${zone.name}
              </strong>


              <span

                style="
                  font-size:12px;
                  opacity:.65;
                  margin-left:8px;
                "

              >

                ${localities.length}
                localities

              </span>

            </td>


            <td>
              ${zone.households}
            </td>


            <td>

              ${Number(
                zone.inventoryRice || 0
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits:2
                }
              )}

              kg

            </td>


            <td>

              ${Number(
                zone.demandRice || 0
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits:2
                }
              )}

              kg

            </td>


            <td>

              ${Number(
                zone.inventoryMilk || 0
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits:2
                }
              )}

              L

            </td>


            <td>

              ${Number(
                zone.demandMilk || 0
              ).toLocaleString(
                undefined,
                {
                  maximumFractionDigits:2
                }
              )}

              L

            </td>


            <td>

              <span
                class="status-pill ${zoneStatus.cls}"
              >

                ${zoneStatus.label}

              </span>

            </td>

          </tr>

        `;


        /* ---------------------------------------------------
           LOCALITY ROWS
        --------------------------------------------------- */

        localities.forEach(
          locality => {

            tableHTML += `

              <tr

                class="
                  locality-row
                  zone-${zoneIndex}
                "

                style="
                  display:none;
                "

              >

                <td
                  style="
                    padding-left:45px;
                  "
                >

                  ${locality.name}

                </td>


                <td>

                  ${locality.households}

                </td>


                <td>

                  <span
                    style="
                      opacity:.55;
                    "
                  >
                    Zone level
                  </span>

                </td>


                <td>

                  ${Number(
                    locality.demandRice || 0
                  ).toFixed(2)}

                  kg

                </td>


                <td>

                  <span
                    style="
                      opacity:.55;
                    "
                  >
                    Zone level
                  </span>

                </td>


                <td>

                  ${Number(
                    locality.demandMilk || 0
                  ).toFixed(2)}

                  L

                </td>


                <td>

                  <span
                    class="status-pill ok"
                  >

                    Demand tracked

                  </span>

                </td>

              </tr>

            `;

          }
        );

      }
    );


    tableHTML += `

      </tbody>

    `;


    table.innerHTML =
      tableHTML;


    /* =======================================================
       AI INVENTORY RECOMMENDATIONS
    ======================================================= */

    if(alertZones.length === 0){

      alertsList.innerHTML = `

        <div class="alert-item">

          <strong>
            All zones are adequately stocked.
          </strong>

          <p>
            Current zone inventory is sufficient
            for the predicted demand.
          </p>

        </div>

      `;

    }else{

      alertsList.innerHTML =
        alertZones
          .map(zone => {

            const status =
              getZoneStatus(zone);


            const riceGap =
              Number(
                zone.demandRice || 0
              ) -
              Number(
                zone.inventoryRice || 0
              );


            const milkGap =
              Number(
                zone.demandMilk || 0
              ) -
              Number(
                zone.inventoryMilk || 0
              );


            return `

              <div class="alert-item">

                <strong>

                  ${zone.name}
                  —
                  ${status.label}

                </strong>


                <p>

                  Rice:

                  ${
                    riceGap > 0

                      ? `${riceGap.toFixed(2)}
                         kg additional requirement`

                      : "inventory sufficient"
                  }


                  <br>


                  Milk:

                  ${
                    milkGap > 0

                      ? `${milkGap.toFixed(2)}
                         L additional requirement`

                      : "inventory sufficient"
                  }

                </p>

              </div>

            `;

          })
          .join("");

    }


  }catch(error){

    console.error(
      "Admin dashboard error:",
      error
    );


    kpiGrid.innerHTML = "";


    table.innerHTML = `

      <tbody>

        <tr>

          <td colspan="7">

            Unable to load live inventory data.

            <br><br>

            Make sure the SupplySense AI backend
            is running on port 8000.

          </td>

        </tr>

      </tbody>

    `;


    alertsList.innerHTML = `

      <div class="alert-item">

        <strong>
          Backend connection error
        </strong>

        <p>
          ${error.message}
        </p>

      </div>

    `;

  }

}


/* ========================================================
   EXPAND / COLLAPSE ZONE
======================================================== */

function toggleZoneRows(zoneIndex){

  const rows =
    document.querySelectorAll(
      `.locality-row.zone-${zoneIndex}`
    );


  const arrow =
    document.getElementById(
      `zone-arrow-${zoneIndex}`
    );


  if(!rows.length){
    return;
  }


  const isHidden =
    rows[0].style.display === "none";


  rows.forEach(
    row => {

      row.style.display =
        isHidden
          ? "table-row"
          : "none";

    }
  );


  if(arrow){

    arrow.textContent =
      isHidden
        ? "▼"
        : "▶";

  }

}
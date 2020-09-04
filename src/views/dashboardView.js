import { navBarClient } from '../lib/navBarClient.js';
import { viewBoard } from '../lib/HtmlComponents.js';
import { requestAllQhawax } from '../requests/get.js';
import { addZero } from '../lib/mapAssets.js';

const ppbToECAdash = (sensor) => {
  switch (sensor) {
  case 'CO':
    return { ECA: 10000 * 0.87, factor: 1.144919906 };
  case 'NO2':
    return { ECA: 100 * 0.532, factor: 1.880677075 };
  case 'O3':
    return { ECA: 100 * 0.51, factor: 1.962019118 };
  case 'H2S':
    return { ECA: 150 * 0.719, factor: 1.393033574 };
  case 'SO2':
    return { ECA: 250 * 0.382, factor: 2.618478014 };
  case 'PM25':
    return { ECA: 50, factor: 1 };
  case 'PM10':
    return { ECA: 100, factor: 1 };
  default:
    return { ECA: 100000000, factor: 1 };
  }
};

let valuesForDashboard = {
  ID:{value:null,color:''},
  lat:{value:null,color:''},
  lon:{value:null,color:''},
  UV:{value:null,color:''},
  spl:{value:null,color:''},
  timestamp:{value:null,color:''},
  PM1:{value:null,color:''},
  humidity:{value:null,color:''},
  pressure:{value:null,color:''},
  temperature:{value:null,color:''},
  PM10:{value:null,color:''},
  SO2:{value:null,color:''},
  CO:{value:null,color:''},
  H2S:{value:null,color:''},
  PM25:{value:null,color:''},
  O3:{value:null,color:''},
  NO2:{value:null,color:''},
}


const indexValue = (data) => {
  Object.entries(valuesForDashboard).forEach(([key]) => { 
    valuesForDashboard[key].value=data[key]
    valuesForDashboard[key].value >= ppbToECAdash(key).ECA ? valuesForDashboard[key].color= 'red' : valuesForDashboard[key].color= 'black';
   });
return valuesForDashboard;
  
};

const dashboardRow = (q) =>`
<td><strong>${q.name}</strong></td> 
<td>${q.comercial_name}</td> 
<td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td>
<td><i class="material-icons" style="color:gray">signal_wifi_off</i></td>
`;
const dashboardRowActive =(data,q,value)=>`
<td><strong>${data.ID}</strong></td>
<td>${q.comercial_name}</td>
<td>${new Date(Date.parse(value.timestamp.value)).toLocaleString('en-EN')}</td>
<td style="color:${value.SO2.color}">${value.SO2.value.toFixed(1)}</td> 
<td style="color:${value.NO2.color}">${value.NO2.value.toFixed(1)}</td> 
<td style="color:${value.CO.color}">${value.CO.value.toFixed(1)}</td> 
<td style="color:${value.H2S.color}">${value.H2S.value.toFixed(1)}</td>
<td style="color:${value.O3.color}">${value.O3.value.toFixed(1)}</td>  
<td style="color:${value.PM25.color}">${value.PM25.value.toFixed(1)}</td> 
<td style="color:${value.PM10.color}">${value.PM10.value.toFixed(1)}</td> 
<td style="color:${value.UV.color}">${value.UV.value.toFixed(0)}</td> 
<td>${value.spl.value.toFixed(1)}</td>
<td>${value.temperature.value.toFixed(1)}</td>
<td>${value.humidity.value.toFixed(1)}</td>
<td>${(value.pressure.value/1000).toFixed(1)}</td>  
<td><i class="material-icons" style="color:#32CD32">wifi</i></td>
`;
const request = async(element, qhawax_asigned) => {
  const table_body = element.querySelector('tbody');
	const qhawax_list = await requestAllQhawax();
  qhawax_list.forEach((q) => qhawax_asigned.push(q));
    qhawax_asigned.forEach((q) => {
				 const row_table = document.createElement('tr');
				 row_table.setAttribute('data-name', `${q.name}`);
				 table_body.appendChild(row_table);
				 let row_data = dashboardRow(q)
				 row_table.innerHTML = row_data;
				 const socket = io.connect('https://qairamapnapi-dev-opensource.qairadrones.com/');
				 socket.on('new_data_summary_processed', (data) => {
					 if (q.name === data.ID) {
						 const value = indexValue(data);
						 row_data = dashboardRowActive(data,q,value)
						 row_table.innerHTML = row_data;
					 }
				 });
			 });
   };
   
const viewDashboard = () => {
  const dashboardElem = document.createElement('div');
  dashboardElem.classList.add('dashboard');
  navBarClient(dashboardElem, viewBoard);
  const qhawax_asigned = [];
  request(dashboardElem, qhawax_asigned);
  return dashboardElem;
};

export {
  viewDashboard, addZero, ppbToECAdash, indexValue, request,
};

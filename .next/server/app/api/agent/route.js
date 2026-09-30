(()=>{var e={};e.id=398,e.ids=[398],e.modules={399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},9491:e=>{"use strict";e.exports=require("assert")},4300:e=>{"use strict";e.exports=require("buffer")},2081:e=>{"use strict";e.exports=require("child_process")},6113:e=>{"use strict";e.exports=require("crypto")},2361:e=>{"use strict";e.exports=require("events")},7147:e=>{"use strict";e.exports=require("fs")},3292:e=>{"use strict";e.exports=require("fs/promises")},3685:e=>{"use strict";e.exports=require("http")},5687:e=>{"use strict";e.exports=require("https")},1808:e=>{"use strict";e.exports=require("net")},2254:e=>{"use strict";e.exports=require("node:buffer")},7561:e=>{"use strict";e.exports=require("node:fs")},8849:e=>{"use strict";e.exports=require("node:http")},2286:e=>{"use strict";e.exports=require("node:https")},7503:e=>{"use strict";e.exports=require("node:net")},9411:e=>{"use strict";e.exports=require("node:path")},7742:e=>{"use strict";e.exports=require("node:process")},4492:e=>{"use strict";e.exports=require("node:stream")},6402:e=>{"use strict";e.exports=require("node:stream/promises")},2477:e=>{"use strict";e.exports=require("node:stream/web")},3020:e=>{"use strict";e.exports=require("node:url")},7261:e=>{"use strict";e.exports=require("node:util")},5628:e=>{"use strict";e.exports=require("node:zlib")},2037:e=>{"use strict";e.exports=require("os")},1017:e=>{"use strict";e.exports=require("path")},7282:e=>{"use strict";e.exports=require("process")},3477:e=>{"use strict";e.exports=require("querystring")},2781:e=>{"use strict";e.exports=require("stream")},4404:e=>{"use strict";e.exports=require("tls")},6224:e=>{"use strict";e.exports=require("tty")},7310:e=>{"use strict";e.exports=require("url")},3837:e=>{"use strict";e.exports=require("util")},1267:e=>{"use strict";e.exports=require("worker_threads")},9796:e=>{"use strict";e.exports=require("zlib")},8359:()=>{},3739:()=>{},6749:(e,r,a)=>{"use strict";a.r(r),a.d(r,{originalPathname:()=>q,patchFetch:()=>D,requestAsyncStorage:()=>k,routeModule:()=>P,serverHooks:()=>E,staticGenerationAsyncStorage:()=>V});var i={};a.r(i),a.d(i,{GET:()=>U,POST:()=>x,runtime:()=>A});var t=a(9303),s=a(8716),o=a(670),n=a(7070),c=a(9953);function l(e){if(!e||"string"!=typeof e)return"INR";let r=e.trim().toUpperCase();return"₹"===r||"RUPEE"===r||"RUPEES"===r?"INR":"$"===r||"DOLLAR"===r||"DOLLARS"===r?"USD":"INR"===r||"USD"===r?r:"INR"}function u(e,r="INR"){let a=l(r);return new Intl.NumberFormat("INR"===a?"en-IN":"en-US",{style:"currency",currency:a,maximumFractionDigits:0}).format(e)}function y(e){return"string"!=typeof e?null:e.trim().toLowerCase()}function d(e){if("number"==typeof e&&Number.isFinite(e))return e;if("string"==typeof e){let r=Number(e.replace(/,/g,"").trim());if(Number.isFinite(r))return r}return null}var p=a(3292),g=a.n(p),m=a(1017),h=a.n(m);async function f(e={}){let r=new URLSearchParams;e.bodyType&&r.set("body_type",e.bodyType),null!=e.maxPrice&&r.set("max_price",String(e.maxPrice)),null!=e.minPrice&&r.set("min_price",String(e.minPrice)),e.fuelType&&r.set("fuel",e.fuelType),e.transmission&&r.set("transmission",e.transmission),r.set("limit","50");try{let e;let r=process.cwd(),a=h().join(r,"data","car.json");try{e=await g().readFile(a,"utf-8")}catch{a=h().join(r,"data","cars.json"),e=await g().readFile(a,"utf-8")}let i=JSON.parse(e);if(Array.isArray(i))return i;if(i&&Array.isArray(i.cars))return i.cars;if(i&&Array.isArray(i.data))return i.data;return[]}catch(e){return console.error("[getCars] Error loading car data from filesystem:",e),[]}}async function b(e={}){let r=d(e.maxPrice),a=d(e.minPrice),i=l(e.currency);if(e.budget){let a=function(e,r="INR"){if("string"!=typeof e)return null;let a=e.trim();if(!a)return null;let i=a.toLowerCase().replace(/,/g,"").replace(/₹/g," inr ").replace(/\$/g," usd ").replace(/\s+/g," ").trim(),t=l(r);(i.includes("inr")||i.includes("rupee")||i.includes("rupees"))&&(t="INR"),(i.includes("usd")||i.includes("dollar")||i.includes("dollars"))&&(t="USD");let s=i.match(/(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|lacs|l|crore|crores|cr)\b/i);if(s){let e=Number(s[1]),r=s[2],i=function(e,r){let a=Number(e);if(!Number.isFinite(a))return null;let i=String(r||"").trim().toLowerCase();return"lakh"===i||"lakhs"===i||"lac"===i||"lacs"===i||"l"===i?1e5*a:"crore"===i||"crores"===i||"cr"===i?1e7*a:a}(e,r);return null===i?null:{amount:i,currency:"INR",originalInput:a,unit:r}}let o=i.match(/(\d+(?:\.\d+)?)/);if(!o)return null;let n=Number(o[1]);return Number.isFinite(n)?{amount:n,currency:t,originalInput:a,unit:null}:null}(e.budget,i);console.log("[search_cars] Parsed budget:",a),a&&(i=a.currency,r=a.amount)}let t=y(e.bodyType),s=y(e.fuelType),o=y(e.transmission),n=d(e.seats);console.log("[search_cars] Received filters:",e),console.log("[search_cars] Normalized filters:",{maxPrice:r,minPrice:a,requestedCurrency:i,bodyType:t,fuelType:s,transmission:o,seats:n});let c=await f();console.log("[search_cars] Total cars loaded:",c?.length||0);let p=function(e,r={}){if(!Array.isArray(e))return[];let{query:a,name:i,model:t,brand:s,make:o,maxPrice:n,minPrice:c,currency:l,bodyType:u,fuelType:p,transmission:g,seats:m}=r,h=y(a||i||t||s||o),f=d(n),b=d(c),w=y(u),M=y(p),T=y(g),S=d(m),C=y(l),R=[...e];return h&&(R=R.filter(e=>{let r=y(e.name||e.model||""),a=y(e.brand||e.make||""),i=`${a} ${r}`.trim();return r.includes(h)||a.includes(h)||i.includes(h)||h.includes(r)})),C&&(R=R.filter(e=>y(e.currency)===C)),null!==f&&(R=R.filter(e=>Number(e.price)<=f)),null!==b&&(R=R.filter(e=>Number(e.price)>=b)),w&&(R=R.filter(e=>y(e.bodyType||e.body_type)===w)),M&&(R=R.filter(e=>y(e.fuelType||e.fuel)===M)),T&&(R=R.filter(e=>y(e.transmission)===T)),null!==S&&(R=R.filter(e=>Number(e.seats)>=S)),R}(c||[],{maxPrice:r,minPrice:a,currency:i,bodyType:t,fuelType:s,transmission:o,seats:n});return console.log(`[search_cars] Found ${p.length} matching cars.`),{success:!0,count:p.length,currency:i,cars:p,appliedFilters:{maxPrice:r,minPrice:a,currency:i,bodyType:t,fuelType:s,transmission:o,seats:n},summary:{maxPrice:null!==r?u(r,i):null,minPrice:null!==a?u(a,i):null}}}async function w({carId:e,name:r,model:a,query:i}){let t=await f();if(!t||0===t.length)return{success:!1,error:"No car data available."};if(null!=e){let r=Number(e);if(Number.isInteger(r)){let e=t.find(e=>Number(e.id)===r);if(e)return{success:!0,car:e}}}let s=y(r||a||i||e);if(s){let e=t.find(e=>{let r=y(e.name||e.model||""),a=y(e.brand||e.make||""),i=`${a} ${r}`.trim();return r.includes(s)||a.includes(s)||i.includes(s)||s.includes(r)});if(e)return{success:!0,car:e}}return{success:!1,error:"No car found matching the provided identifier or query."}}let M=JSON.parse('[{"id":1,"brand":"Toyota","model":"Camry","price":4748000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":12.5,"horsepower":203,"bootSpace":420,"safetyRating":5,"cityMileage":11,"highwayMileage":14.5,"groundClearance":165,"serviceCost":12000},{"id":2,"brand":"Honda","model":"Civic","price":1429000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":13.2,"horsepower":178,"bootSpace":470,"safetyRating":5,"cityMileage":12,"highwayMileage":15,"groundClearance":160,"serviceCost":11000},{"id":3,"brand":"Ford","model":"Mustang","price":4656000,"currency":"INR","fuelType":"Petrol","bodyType":"Coupe","transmission":"Manual","seats":4,"mileage":9.8,"horsepower":310,"bootSpace":380,"safetyRating":4,"cityMileage":8.5,"highwayMileage":11.5,"groundClearance":140,"serviceCost":18000},{"id":4,"brand":"Tesla","model":"Model 3","price":5500000,"currency":"INR","fuelType":"Electric","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":0,"horsepower":283,"bootSpace":425,"safetyRating":5,"cityMileage":0,"highwayMileage":0,"groundClearance":140,"serviceCost":8000},{"id":5,"brand":"BMW","model":"X5","price":7500000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":11,"horsepower":265,"bootSpace":650,"safetyRating":5,"cityMileage":9.5,"highwayMileage":13,"groundClearance":215,"serviceCost":25000},{"id":6,"brand":"Mercedes-Benz","model":"C-Class","price":4800000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":11.5,"horsepower":201,"bootSpace":455,"safetyRating":5,"cityMileage":10,"highwayMileage":13.5,"groundClearance":150,"serviceCost":22000},{"id":7,"brand":"Audi","model":"Q7","price":8866000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":10.8,"horsepower":286,"bootSpace":700,"safetyRating":5,"cityMileage":9,"highwayMileage":12.5,"groundClearance":220,"serviceCost":28000},{"id":8,"brand":"Hyundai","model":"Creta","price":1091000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":15.5,"horsepower":115,"bootSpace":433,"safetyRating":4,"cityMileage":14,"highwayMileage":17,"groundClearance":190,"serviceCost":9000},{"id":9,"brand":"Kia","model":"Seltos","price":1150000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":14.2,"horsepower":138,"bootSpace":433,"safetyRating":4,"cityMileage":12.5,"highwayMileage":16,"groundClearance":190,"serviceCost":9500},{"id":10,"brand":"Mahindra","model":"Thar","price":1650000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":4,"mileage":13,"horsepower":130,"bootSpace":250,"safetyRating":3,"cityMileage":11.5,"highwayMileage":14.5,"groundClearance":225,"serviceCost":10000},{"id":11,"brand":"Tata","model":"Nexon","price":740000,"currency":"INR","fuelType":"Electric","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":0,"horsepower":127,"bootSpace":350,"safetyRating":5,"cityMileage":0,"highwayMileage":0,"groundClearance":205,"serviceCost":7000},{"id":12,"brand":"Maruti Suzuki","model":"Swift","price":579000,"currency":"INR","fuelType":"Petrol","bodyType":"Hatchback","transmission":"Manual","seats":5,"mileage":18.5,"horsepower":82,"bootSpace":268,"safetyRating":3,"cityMileage":17,"highwayMileage":20,"groundClearance":165,"serviceCost":6000},{"id":13,"brand":"Volkswagen","model":"Tiguan","price":1900000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":12.8,"horsepower":190,"bootSpace":520,"safetyRating":5,"cityMileage":11,"highwayMileage":14.5,"groundClearance":200,"serviceCost":16000},{"id":14,"brand":"Jeep","model":"Compass","price":2100000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":13.5,"horsepower":170,"bootSpace":438,"safetyRating":4,"cityMileage":12,"highwayMileage":15,"groundClearance":205,"serviceCost":15000},{"id":15,"brand":"Nissan","model":"Kicks","price":1400000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":14,"horsepower":138,"bootSpace":430,"safetyRating":4,"cityMileage":12.5,"highwayMileage":15.5,"groundClearance":200,"serviceCost":10000},{"id":16,"brand":"Renault","model":"Duster","price":1049000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":15,"horsepower":110,"bootSpace":478,"safetyRating":4,"cityMileage":13.5,"highwayMileage":16.5,"groundClearance":205,"serviceCost":9000},{"id":17,"brand":"Skoda","model":"Octavia","price":2800000,"currency":"INR","fuelType":"Diesel","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":13.8,"horsepower":190,"bootSpace":600,"safetyRating":5,"cityMileage":12,"highwayMileage":15.5,"groundClearance":155,"serviceCost":17000},{"id":18,"brand":"Volvo","model":"XC90","price":9780000,"currency":"INR","fuelType":"Hybrid","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":10.5,"horsepower":455,"bootSpace":640,"safetyRating":5,"cityMileage":9,"highwayMileage":12,"groundClearance":225,"serviceCost":35000},{"id":19,"brand":"Land Rover","model":"Defender","price":10700000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":9.5,"horsepower":240,"bootSpace":700,"safetyRating":5,"cityMileage":8,"highwayMileage":11,"groundClearance":290,"serviceCost":40000},{"id":20,"brand":"Porsche","model":"911","price":21100000,"currency":"INR","fuelType":"Petrol","bodyType":"Coupe","transmission":"Automatic","seats":4,"mileage":8.5,"horsepower":379,"bootSpace":130,"safetyRating":5,"cityMileage":7,"highwayMileage":10,"groundClearance":115,"serviceCost":60000},{"id":21,"brand":"Chevrolet","model":"Trailblazer","price":1800000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":12.2,"horsepower":160,"bootSpace":530,"safetyRating":4,"cityMileage":10.5,"highwayMileage":14,"groundClearance":210,"serviceCost":13000},{"id":22,"brand":"MG","model":"Hector","price":1199000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":14.5,"horsepower":168,"bootSpace":500,"safetyRating":4,"cityMileage":13,"highwayMileage":16,"groundClearance":195,"serviceCost":11000},{"id":23,"brand":"Force","model":"Gurkha","price":1595000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":4,"mileage":11.5,"horsepower":90,"bootSpace":200,"safetyRating":3,"cityMileage":10,"highwayMileage":13,"groundClearance":235,"serviceCost":12000},{"id":24,"brand":"Isuzu","model":"V-Cross","price":2550000,"currency":"INR","fuelType":"Diesel","bodyType":"Pickup","transmission":"Manual","seats":5,"mileage":12,"horsepower":163,"bootSpace":300,"safetyRating":4,"cityMileage":10.5,"highwayMileage":13.5,"groundClearance":225,"serviceCost":14000},{"id":25,"brand":"Lexus","model":"RX","price":8999000,"currency":"INR","fuelType":"Hybrid","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":11.2,"horsepower":308,"bootSpace":520,"safetyRating":5,"cityMileage":10,"highwayMileage":12.5,"groundClearance":205,"serviceCost":30000},{"id":26,"brand":"Toyota","model":"Innova Crysta","price":1999000,"currency":"INR","fuelType":"Diesel","bodyType":"MUV","transmission":"Manual","seats":7,"mileage":14.5,"horsepower":148,"bootSpace":300,"safetyRating":5,"cityMileage":12,"highwayMileage":16,"groundClearance":178,"serviceCost":11000},{"id":27,"brand":"Toyota","model":"Innova Hycross","price":2590000,"currency":"INR","fuelType":"Hybrid","bodyType":"MUV","transmission":"Automatic","seats":7,"mileage":21.1,"horsepower":184,"bootSpace":300,"safetyRating":5,"cityMileage":19.5,"highwayMileage":23,"groundClearance":185,"serviceCost":10500},{"id":28,"brand":"Maruti Suzuki","model":"Ertiga","price":869000,"currency":"INR","fuelType":"Petrol","bodyType":"MUV","transmission":"Manual","seats":7,"mileage":20.5,"horsepower":102,"bootSpace":209,"safetyRating":3,"cityMileage":18,"highwayMileage":22.5,"groundClearance":180,"serviceCost":6500},{"id":29,"brand":"Maruti Suzuki","model":"XL6","price":1161000,"currency":"INR","fuelType":"Petrol","bodyType":"MUV","transmission":"Automatic","seats":6,"mileage":20.2,"horsepower":102,"bootSpace":209,"safetyRating":3,"cityMileage":17.5,"highwayMileage":21.8,"groundClearance":180,"serviceCost":7000},{"id":30,"brand":"Kia","model":"Carens","price":1052000,"currency":"INR","fuelType":"Diesel","bodyType":"MUV","transmission":"Manual","seats":7,"mileage":21.3,"horsepower":114,"bootSpace":216,"safetyRating":3,"cityMileage":18.5,"highwayMileage":23,"groundClearance":195,"serviceCost":8500},{"id":31,"brand":"Renault","model":"Triber","price":600000,"currency":"INR","fuelType":"Petrol","bodyType":"MUV","transmission":"Manual","seats":7,"mileage":19,"horsepower":71,"bootSpace":84,"safetyRating":4,"cityMileage":16.5,"highwayMileage":20.5,"groundClearance":182,"serviceCost":6000},{"id":32,"brand":"Toyota","model":"Rumion","price":1044000,"currency":"INR","fuelType":"Petrol","bodyType":"MUV","transmission":"Automatic","seats":7,"mileage":20.1,"horsepower":102,"bootSpace":209,"safetyRating":3,"cityMileage":17.5,"highwayMileage":21.5,"groundClearance":180,"serviceCost":7000},{"id":33,"brand":"Toyota","model":"Vellfire","price":12230000,"currency":"INR","fuelType":"Hybrid","bodyType":"MUV","transmission":"Automatic","seats":7,"mileage":16.3,"horsepower":190,"bootSpace":500,"safetyRating":5,"cityMileage":14.5,"highwayMileage":17.5,"groundClearance":160,"serviceCost":35000},{"id":34,"brand":"Kia","model":"Carnival","price":6390000,"currency":"INR","fuelType":"Diesel","bodyType":"MUV","transmission":"Automatic","seats":7,"mileage":14.8,"horsepower":197,"bootSpace":540,"safetyRating":5,"cityMileage":12.5,"highwayMileage":16.5,"groundClearance":180,"serviceCost":22000},{"id":35,"brand":"Maruti Suzuki","model":"Invicto","price":2521000,"currency":"INR","fuelType":"Hybrid","bodyType":"MUV","transmission":"Automatic","seats":7,"mileage":21.1,"horsepower":184,"bootSpace":300,"safetyRating":5,"cityMileage":19.5,"highwayMileage":23,"groundClearance":185,"serviceCost":10000},{"id":36,"brand":"Honda","model":"City","price":1208000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":17.8,"horsepower":119,"bootSpace":506,"safetyRating":5,"cityMileage":15,"highwayMileage":19.5,"groundClearance":165,"serviceCost":7500},{"id":37,"brand":"Honda","model":"Amaze","price":792000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":18.6,"horsepower":89,"bootSpace":420,"safetyRating":4,"cityMileage":16,"highwayMileage":20,"groundClearance":170,"serviceCost":6000},{"id":38,"brand":"Hyundai","model":"Verna","price":1100000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":18.6,"horsepower":158,"bootSpace":528,"safetyRating":5,"cityMileage":15.5,"highwayMileage":20.5,"groundClearance":170,"serviceCost":8000},{"id":39,"brand":"Hyundai","model":"Aura","price":649000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":20.5,"horsepower":82,"bootSpace":402,"safetyRating":3,"cityMileage":17.5,"highwayMileage":22,"groundClearance":165,"serviceCost":5500},{"id":40,"brand":"Volkswagen","model":"Virtus","price":1156000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":18.1,"horsepower":148,"bootSpace":521,"safetyRating":5,"cityMileage":14.5,"highwayMileage":19.5,"groundClearance":179,"serviceCost":9000},{"id":41,"brand":"Skoda","model":"Slavia","price":1163000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":19.3,"horsepower":114,"bootSpace":521,"safetyRating":5,"cityMileage":16,"highwayMileage":21,"groundClearance":179,"serviceCost":8800},{"id":42,"brand":"Skoda","model":"Superb","price":5400000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":14.1,"horsepower":188,"bootSpace":625,"safetyRating":5,"cityMileage":11.5,"highwayMileage":16,"groundClearance":156,"serviceCost":22000},{"id":43,"brand":"Maruti Suzuki","model":"Dzire","price":679000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":24.7,"horsepower":80,"bootSpace":382,"safetyRating":5,"cityMileage":21.5,"highwayMileage":26.5,"groundClearance":163,"serviceCost":5500},{"id":44,"brand":"Maruti Suzuki","model":"Ciaz","price":940000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":20.6,"horsepower":103,"bootSpace":510,"safetyRating":4,"cityMileage":17.5,"highwayMileage":22,"groundClearance":170,"serviceCost":6800},{"id":45,"brand":"Tata","model":"Tigor","price":630000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Manual","seats":5,"mileage":19.2,"horsepower":85,"bootSpace":419,"safetyRating":4,"cityMileage":16.5,"highwayMileage":21,"groundClearance":170,"serviceCost":5800},{"id":46,"brand":"Tata","model":"Tigor EV","price":1249000,"currency":"INR","fuelType":"Electric","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":0,"horsepower":74,"bootSpace":316,"safetyRating":4,"cityMileage":0,"highwayMileage":0,"groundClearance":172,"serviceCost":6000},{"id":47,"brand":"BMW","model":"3 Series Gran Limousine","price":6060000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":15.3,"horsepower":255,"bootSpace":480,"safetyRating":5,"cityMileage":12,"highwayMileage":17,"groundClearance":140,"serviceCost":26000},{"id":48,"brand":"Mercedes-Benz","model":"E-Class","price":7850000,"currency":"INR","fuelType":"Diesel","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":16.1,"horsepower":194,"bootSpace":540,"safetyRating":5,"cityMileage":13,"highwayMileage":18,"groundClearance":145,"serviceCost":32000},{"id":49,"brand":"Audi","model":"A4","price":4534000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":17.4,"horsepower":201,"bootSpace":460,"safetyRating":5,"cityMileage":13.5,"highwayMileage":19,"groundClearance":145,"serviceCost":22000},{"id":50,"brand":"Audi","model":"A6","price":6441000,"currency":"INR","fuelType":"Petrol","bodyType":"Sedan","transmission":"Automatic","seats":5,"mileage":14.1,"horsepower":241,"bootSpace":530,"safetyRating":5,"cityMileage":11,"highwayMileage":16,"groundClearance":140,"serviceCost":28000},{"id":51,"brand":"Mahindra","model":"Scorpio-N","price":1385000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":7,"mileage":15.2,"horsepower":172,"bootSpace":460,"safetyRating":5,"cityMileage":12.5,"highwayMileage":16.5,"groundClearance":187,"serviceCost":9500},{"id":52,"brand":"Mahindra","model":"XUV700","price":1399000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":16.5,"horsepower":182,"bootSpace":450,"safetyRating":5,"cityMileage":13,"highwayMileage":18,"groundClearance":200,"serviceCost":11000},{"id":53,"brand":"Mahindra","model":"Scorpio Classic","price":1362000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":7,"mileage":14.4,"horsepower":130,"bootSpace":460,"safetyRating":3,"cityMileage":12,"highwayMileage":15.5,"groundClearance":209,"serviceCost":8500},{"id":54,"brand":"Mahindra","model":"XUV 3XO","price":779000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":18.8,"horsepower":110,"bootSpace":364,"safetyRating":5,"cityMileage":15.5,"highwayMileage":20.5,"groundClearance":201,"serviceCost":7500},{"id":55,"brand":"Mahindra","model":"Bolero Neo","price":990000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":7,"mileage":17.2,"horsepower":100,"bootSpace":384,"safetyRating":3,"cityMileage":14.5,"highwayMileage":18.5,"groundClearance":180,"serviceCost":7500},{"id":56,"brand":"Tata","model":"Harrier","price":1549000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":16.8,"horsepower":168,"bootSpace":445,"safetyRating":5,"cityMileage":13.5,"highwayMileage":18.5,"groundClearance":205,"serviceCost":11500},{"id":57,"brand":"Tata","model":"Safari","price":1619000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":16.3,"horsepower":168,"bootSpace":420,"safetyRating":5,"cityMileage":13,"highwayMileage":17.5,"groundClearance":205,"serviceCost":12000},{"id":58,"brand":"Tata","model":"Punch","price":613000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":20,"horsepower":87,"bootSpace":366,"safetyRating":5,"cityMileage":17,"highwayMileage":21.5,"groundClearance":187,"serviceCost":6000},{"id":59,"brand":"Tata","model":"Punch EV","price":1099000,"currency":"INR","fuelType":"Electric","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":0,"horsepower":120,"bootSpace":366,"safetyRating":5,"cityMileage":0,"highwayMileage":0,"groundClearance":190,"serviceCost":6500},{"id":60,"brand":"Tata","model":"Curvv","price":999000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":20.8,"horsepower":116,"bootSpace":500,"safetyRating":5,"cityMileage":17.5,"highwayMileage":22.5,"groundClearance":208,"serviceCost":8500},{"id":61,"brand":"Tata","model":"Curvv EV","price":1749000,"currency":"INR","fuelType":"Electric","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":0,"horsepower":165,"bootSpace":500,"safetyRating":5,"cityMileage":0,"highwayMileage":0,"groundClearance":190,"serviceCost":7500},{"id":62,"brand":"Maruti Suzuki","model":"Brezza","price":834000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":19.8,"horsepower":101,"bootSpace":328,"safetyRating":4,"cityMileage":17,"highwayMileage":21,"groundClearance":200,"serviceCost":6500},{"id":63,"brand":"Maruti Suzuki","model":"Grand Vitara","price":1099000,"currency":"INR","fuelType":"Hybrid","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":27.9,"horsepower":114,"bootSpace":373,"safetyRating":5,"cityMileage":25,"highwayMileage":29.5,"groundClearance":210,"serviceCost":8000},{"id":64,"brand":"Maruti Suzuki","model":"Fronx","price":751000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":21.7,"horsepower":88,"bootSpace":308,"safetyRating":4,"cityMileage":19,"highwayMileage":23.5,"groundClearance":190,"serviceCost":6000},{"id":65,"brand":"Maruti Suzuki","model":"Jimny","price":1274000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":4,"mileage":16.9,"horsepower":103,"bootSpace":208,"safetyRating":4,"cityMileage":14.5,"highwayMileage":18,"groundClearance":210,"serviceCost":7000},{"id":66,"brand":"Hyundai","model":"Venue","price":794000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":17.5,"horsepower":118,"bootSpace":350,"safetyRating":4,"cityMileage":15,"highwayMileage":19,"groundClearance":195,"serviceCost":7500},{"id":67,"brand":"Hyundai","model":"Exter","price":613000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":19.4,"horsepower":82,"bootSpace":391,"safetyRating":4,"cityMileage":17,"highwayMileage":21,"groundClearance":185,"serviceCost":6000},{"id":68,"brand":"Hyundai","model":"Alcazar","price":1499000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":18.1,"horsepower":114,"bootSpace":180,"safetyRating":4,"cityMileage":15,"highwayMileage":20,"groundClearance":200,"serviceCost":10000},{"id":69,"brand":"Hyundai","model":"Tucson","price":2902000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":15.3,"horsepower":183,"bootSpace":540,"safetyRating":5,"cityMileage":12.5,"highwayMileage":17,"groundClearance":192,"serviceCost":15000},{"id":70,"brand":"Hyundai","model":"Ioniq 5","price":4605000,"currency":"INR","fuelType":"Electric","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":0,"horsepower":214,"bootSpace":531,"safetyRating":5,"cityMileage":0,"highwayMileage":0,"groundClearance":163,"serviceCost":9000},{"id":71,"brand":"Kia","model":"Sonet","price":799000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":22.3,"horsepower":114,"bootSpace":385,"safetyRating":4,"cityMileage":19,"highwayMileage":24.5,"groundClearance":205,"serviceCost":7500},{"id":72,"brand":"Kia","model":"EV6","price":6096000,"currency":"INR","fuelType":"Electric","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":0,"horsepower":320,"bootSpace":520,"safetyRating":5,"cityMileage":0,"highwayMileage":0,"groundClearance":178,"serviceCost":12000},{"id":73,"brand":"Toyota","model":"Fortuner","price":3343000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":14.4,"horsepower":201,"bootSpace":296,"safetyRating":5,"cityMileage":11.5,"highwayMileage":16,"groundClearance":225,"serviceCost":14000},{"id":74,"brand":"Toyota","model":"Urban Cruiser Taisor","price":774000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":21.7,"horsepower":88,"bootSpace":308,"safetyRating":4,"cityMileage":19,"highwayMileage":23.5,"groundClearance":190,"serviceCost":6000},{"id":75,"brand":"Toyota","model":"Urban Cruiser Hyryder","price":1114000,"currency":"INR","fuelType":"Hybrid","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":27.9,"horsepower":114,"bootSpace":373,"safetyRating":5,"cityMileage":25,"highwayMileage":29.5,"groundClearance":210,"serviceCost":8000},{"id":76,"brand":"Toyota","model":"Land Cruiser 300","price":21000000,"currency":"INR","fuelType":"Diesel","bodyType":"SUV","transmission":"Automatic","seats":5,"mileage":9.5,"horsepower":304,"bootSpace":1131,"safetyRating":5,"cityMileage":7.5,"highwayMileage":11,"groundClearance":235,"serviceCost":50000},{"id":77,"brand":"Volkswagen","model":"Taigun","price":1170000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":19.8,"horsepower":114,"bootSpace":385,"safetyRating":5,"cityMileage":16.5,"highwayMileage":21.5,"groundClearance":188,"serviceCost":9000},{"id":78,"brand":"Skoda","model":"Kushaq","price":1189000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":19.7,"horsepower":114,"bootSpace":385,"safetyRating":5,"cityMileage":16.5,"highwayMileage":21.5,"groundClearance":188,"serviceCost":9000},{"id":79,"brand":"Skoda","model":"Kodiaq","price":3999000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Automatic","seats":7,"mileage":13.3,"horsepower":188,"bootSpace":270,"safetyRating":5,"cityMileage":10.5,"highwayMileage":15,"groundClearance":192,"serviceCost":22000},{"id":80,"brand":"MG","model":"Astor","price":998000,"currency":"INR","fuelType":"Petrol","bodyType":"SUV","transmission":"Manual","seats":5,"mileage":15.4,"horsepower":108,"bootSpace":400,"safetyRating":5,"cityMileage":13,"highwayMileage":17,"groundClearance":180,"serviceCost":8500}]');async function T({carIds:e}){if(!Array.isArray(e))return{success:!1,error:"carIds must be an array."};if(e.length<2)return{success:!1,error:"At least two car IDs are required for comparison."};if(e.length>4)return{success:!1,error:"A maximum of four cars can be compared at once."};let r=e.map(Number);if(r.some(e=>!Number.isInteger(e)))return{success:!1,error:"All car IDs must be integers."};let a=M.filter(e=>r.includes(Number(e.id)));return a.length!==r.length?{success:!1,error:"One or more requested cars could not be found."}:{success:!0,count:a.length,cars:a}}async function S(e={}){let r=[...M],a=y(e.bodyType),i=y(e.fuelType),t=y(e.transmission),s=d(e.maxPrice),o=d(e.seats);a&&(r=r.filter(e=>y(e.bodyType)===a)),i&&(r=r.filter(e=>y(e.fuelType)===i)),t&&(r=r.filter(e=>y(e.transmission)===t)),null!==s&&(r=r.filter(e=>e.price<=s)),null!==o&&(r=r.filter(e=>e.seats>=o));let n=r.map(r=>({...r,recommendationScore:function(e,r){let a=0,i=d(r.maxPrice),t=y(r.fuelType),s=y(r.transmission),o=y(r.bodyType),n=d(r.seats);return"high"===y(r.mileagePriority)&&(e.mileage>=15?a+=20:e.mileage>=12&&(a+=10)),null!==i&&(e.price<=i?a+=30:a-=30),o&&y(e.bodyType)===o&&(a+=25),s&&y(e.transmission)===s&&(a+=15),t&&y(e.fuelType)===t&&(a+=15),null!==n&&e.seats>=n&&(a+=15),a}(r,e)})).sort((e,r)=>r.recommendationScore-e.recommendationScore);return{success:!0,count:n.length,cars:n.slice(0,5),appliedPreferences:{bodyType:a,fuelType:i,transmission:t,maxPrice:s,seats:o}}}var C=a(8957);let R=[{name:"search_cars",description:"Search the car inventory based on user requirements such as budget, currency, body type, fuel type, transmission, and seating capacity. Use this tool whenever the user asks to find, search, or filter cars.",parameters:{type:"object",properties:{budget:{type:"string",description:"The user's original budget expression when available, such as '20 lakh', '₹15 lakh', '1 crore', '$20,000', or '20000 USD'. Preserve the user's original budget wording when possible."},maxPrice:{type:"number",description:"Maximum numeric car price after converting the user's budget into the inventory currency's base unit. Example: 2000000 means 20 lakh INR."},minPrice:{type:"number",description:"Minimum numeric car price after converting the user's budget into the inventory currency's base unit."},currency:{type:"string",enum:["INR","USD"],description:"Currency specified or implied by the user. Use INR for rupees, lakh, lakhs, crore, ₹, or Indian pricing."},bodyType:{type:"string",description:"Preferred body type such as SUV, Sedan, Hatchback, Coupe, or Pickup."},fuelType:{type:"string",description:"Preferred fuel type such as Petrol, Diesel, Electric, CNG, or Hybrid."},transmission:{type:"string",description:"Preferred transmission such as Automatic or Manual."},seats:{type:"number",description:"Minimum number of seats required."}}}},{name:"get_car_details",description:"Get detailed information about one specific car from the inventory. Use this when the user asks for more information, specifications, price, fuel type, seating, mileage, or other details about a specific car.",parameters:{type:"object",properties:{carId:{type:"number",description:"The unique ID of the car."}},required:["carId"]}},{name:"compare_cars",description:"Compare two to four cars from the inventory. Use this when the user explicitly asks to compare cars or wants to know which of several cars is better.",parameters:{type:"object",properties:{carIds:{type:"array",items:{type:"number"},description:"Array containing the unique IDs of the cars to compare."}},required:["carIds"]}},{name:"recommend_cars",description:"Recommend the best matching cars based on the user's stated requirements. Apply hard requirements such as budget, body type, fuel type, transmission, and minimum seats first. Then rank the remaining cars using preferences such as mileage priority.",parameters:{type:"object",properties:{maxPrice:{type:"number",description:"Maximum acceptable car price in the inventory currency."},bodyType:{type:"string",description:"Preferred body type such as SUV, Sedan, Hatchback, Coupe, or Pickup."},fuelType:{type:"string",description:"Preferred fuel type such as Petrol, Diesel, Electric, CNG, or Hybrid."},transmission:{type:"string",description:"Preferred transmission such as Automatic or Manual."},seats:{type:"number",description:"Minimum number of seats required."},mileagePriority:{type:"string",enum:["low","medium","high"],description:"How important fuel efficiency or mileage is to the user. Use high when the user strongly prioritizes mileage or fuel economy."}}}},{name:"search_web_cars",description:"Search the web for current and real-world information about cars, especially in the Indian automobile market. Use this tool when the user asks for latest prices, newly launched cars, current variants, recent specifications, availability, mileage, features, launch information, or information that may have changed over time. Do not use this tool for searching the local inventory unless current information is required.",parameters:{type:"object",properties:{query:{type:"string",description:"A clear and specific web search query about cars. Include the car name, brand, model, or information being requested whenever possible. Example: 'latest Tata Nexon price in India 2026'."}},required:["query"]}}],v={search_cars:b,search_web_cars:async function({query:e}){if("string"!=typeof e||0===e.trim().length)return{success:!1,error:"A valid search query is required."};try{let r=await (0,C.Q)(e.trim());if(!r?.success)return{success:!1,error:r?.error||"Unable to retrieve current information from the web."};return{success:!0,data:{answer:r.answer||"",sources:Array.isArray(r.sources)?r.sources:[],conflicts:r.conflicts||{hasConflict:!1,conflictTypes:[],price:{hasConflict:!1,values:[]}},metadata:r.metadata||{sourceCount:0,hasOfficialSource:!1,hasEstablishedSource:!1,hasConflict:!1}}}}catch(e){return console.error("[search_web] Search failed:",e),{success:!1,error:"Unable to retrieve current information from the web."}}},get_car_details:w,compare_cars:T,recommend_cars:S},I=`

You are an AI car-shopping assistant focused primarily on
the Indian automobile market.

You have access to tools for searching, inspecting,
comparing, recommending vehicles, and retrieving current
vehicle information from the web.


==================================================
TOOL USAGE RULES
==================================================

Use search_cars when the user wants vehicles matching
specific filters from the local inventory.

Use get_car_details when the user asks for detailed
information about a specific vehicle in the inventory.

Use compare_cars when the user explicitly wants two or
more vehicles compared.

Use recommend_cars when the user asks which car is best
for their needs or asks for a recommendation.

Use search_web_cars when the user requests current,
recent, latest, real-world, or market-dependent
information.

Examples include:

- Latest car prices
- Current ex-showroom prices
- On-road prices
- New car launches
- Upcoming cars
- Recently updated specifications
- Current availability
- Current variants
- Recent automotive news


==================================================
HYBRID TOOL ROUTING
==================================================

Choose the tool based on the type of information needed.

Use LOCAL INVENTORY TOOLS for:

- Cars stored in the application's inventory
- Filtering cars
- Comparing inventory cars
- Recommendations based on inventory

Use WEB SEARCH for:

- Latest information
- Current prices
- Recent launches
- Upcoming vehicles
- Information that may have changed over time


==================================================
SOURCE AWARENESS
==================================================

Information returned by local inventory tools comes from
the application's local vehicle inventory.

Information returned by search_web_cars comes from web
search grounding and may include information from multiple
web sources.

Do not claim that web search information came from the
local inventory.

Do not claim that local inventory information is the
latest market information unless web search confirms it.


==================================================
PRICE RELIABILITY RULES
==================================================

When answering questions about vehicle prices:

Always clearly distinguish between:

- Ex-showroom price
- On-road price

Never present an on-road price as an ex-showroom price.

If an on-road price is mentioned, specify the city whenever
that information is available.

Do not combine different price types into one price range.

For example:

Correct:

"Ex-showroom prices range from ₹8 lakh to ₹15 lakh.
On-road prices vary by city and may be higher."

Incorrect:

"The price ranges from ₹8 lakh to ₹17 lakh."

If sources provide conflicting prices:

- Do not invent a single exact price.
- Explain that prices vary depending on variant, city,
  pricing updates, and source.
- Prefer official manufacturer information when available.
- Clearly mention whether a price is approximate.


==================================================
WEB SEARCH RELIABILITY RULES
==================================================

When using search_web_cars:

Use only information returned by the tool.

Do not invent current prices, variants, launch dates,
specifications, or availability.

If the search result is unsuccessful:

Do not guess.

Tell the user that current information could not be
retrieved.

If multiple web sources disagree:

Do not silently choose one value without explanation.

Prefer official manufacturer sources when available.

Otherwise, present the information as approximate and
explain that prices may vary.


==================================================
SOURCE PRIORITY
==================================================

When evaluating web search information, prefer sources in
this order:

1. Official manufacturer websites

2. Official Indian automotive manufacturer pages

3. Government or regulatory sources when relevant

4. Established automotive publications

5. Other automotive marketplaces or information websites


==================================================
ANSWER QUALITY RULES
==================================================

Never invent vehicle information.

Only use information returned by tools when making factual
claims about cars.

Respect the user's budget and hard requirements.

Do not recommend vehicles that violate explicit hard
requirements such as:

- Maximum budget
- Required body type
- Transmission
- Fuel type
- Minimum seating capacity

If the user's request is missing important information,
ask a concise clarification question instead of guessing.

Keep answers clear and concise.

When discussing prices, always specify whether the price is:

- Ex-showroom
- On-road
- Approximate
- Variant-specific

Focus primarily on the Indian automobile market unless
the user explicitly asks about another country.


SOURCE-AWARE ANSWER RULES

When search_web_cars returns sourceAwareContext:

1. Treat the source reliability information as metadata about the retrieved information.

2. Prefer Tier 1 official manufacturer information when it directly answers the user's question.

3. Tier 2 established automotive sources may be used when:
   - official information is unavailable,
   - additional market context is useful,
   - or the user asks for broader market information.

4. Tier 3 sources should be treated with lower confidence and should not override directly relevant Tier 1 information without a clear reason.

5. Do not automatically treat multiple different prices as a conflict.

6. Before calling prices conflicting, determine whether they refer to:
   - ex-showroom price,
   - on-road price,
   - starting price,
   - specific variant price,
   - approximate price,
   - different model years,
   - or another clearly different context.

7. Clearly label price type whenever it is available.

8. If sources genuinely disagree about the same fact, acknowledge the disagreement instead of silently choosing one.

9. Never invent a source, price, specification, launch date, availability status, or other vehicle information.

10. The sourceAwareContext is supporting evidence. It must not be treated as permission to create facts that are absent from the retrieved information.



`;async function N(e){let r=e.map(e=>({role:"assistant"===e.role?"model":"user",parts:[{text:e.content}]}));for(let e=0;e<5;e++){console.log(`[Agent] Starting step ${e+1}`);let a=await c.ai.models.generateContent({model:c.P,contents:r,config:{systemInstruction:I,tools:[{functionDeclarations:R}]}}),i=a.functionCalls;if(console.log("[Agent] Function calls:",JSON.stringify(i,null,2)),!i||0===i.length)return console.log("[Agent] Final answer generated."),a.text;r.push(a.candidates[0].content);let t=[];for(let e of i){let r=e.name,a=e.args??{},i=v[r];if(console.log(`[Agent] Executing tool: ${r}`),console.log("[Agent] Tool arguments:",a),!i){t.push({functionResponse:{name:r,response:{error:`Unknown tool: ${r}`},id:e.id}});continue}try{let s=await i(a),o=s;if("search_web_cars"===r&&s?.success&&s?.data){let e=function(e={}){if(!e||"object"!=typeof e)return"";let r="string"==typeof e.answer?e.answer:"",a=Array.isArray(e.sources)?e.sources:[],i=e.conflicts||{},t=e.metadata||{},s=a.slice(0,10).map((e,r)=>{let a="number"==typeof e.tier?e.tier:3,i=e.reliability||"other",t=e.title||"Unknown source";return`${r+1}. ${t} | Tier ${a} | ${i}`}).join("\n"),o=i.hasConflict||t.hasConflict?"Potential conflict detected.":"No detected conflict.";return`
WEB SEARCH RESULT

Answer:
${r}

Source reliability:
${s||"No sources available."}

Conflict status:
${o}

Source rules:
- Tier 1 = official manufacturer or primary source.
- Tier 2 = established automotive source.
- Tier 3 = other source.
- Prefer Tier 1 when directly relevant.
- Do not claim that different prices conflict unless they refer to the same price type, model, variant, and relevant time period.
- Clearly distinguish ex-showroom, on-road, starting price, variant price, and approximate price.
- Do not invent information that is not supported by the search result.
`}(s.data);o={...s,data:{...s.data,sourceAwareContext:e}}}t.push({functionResponse:{name:r,response:{result:o},id:e.id}}),console.log(`[Agent] Tool "${r}" completed successfully.`)}catch(a){console.error(`[Agent] Tool "${r}" failed:`,a),t.push({functionResponse:{name:r,response:{error:`Tool "${r}" failed to execute.`},id:e.id}})}}r.push({role:"user",parts:t}),console.log(`[Agent] Step ${e+1} completed.`)}throw Error("Agent exceeded the maximum number of tool execution steps.")}let A="nodejs";async function x(e){let r;try{r=await e.json()}catch{return n.NextResponse.json({error:"Invalid JSON body."},{status:400})}let{messages:a}=r??{},i=function(e){if(!Array.isArray(e))return"'messages' must be an array.";if(0===e.length)return"'messages' cannot be empty.";if(e.length>30)return"Too many messages in history (max 30).";for(let r of e){if(!r||"object"!=typeof r)return"Each message must be an object.";if("user"!==r.role&&"assistant"!==r.role)return"Each message must have role 'user' or 'assistant'.";if("string"!=typeof r.content||0===r.content.trim().length)return"Each message must have non-empty string content.";if(r.content.length>4e3)return"Message content exceeds 4000 characters."}return null}(a);if(i)return n.NextResponse.json({error:i},{status:400});try{let e=await N(a);return n.NextResponse.json({reply:e},{status:200})}catch(e){return console.error("[/api/agent] Gemini request failed:",e),n.NextResponse.json({error:"The assistant is temporarily unavailable. Please try again."},{status:502})}}async function U(){return n.NextResponse.json({error:"Method not allowed. Use POST."},{status:405})}let P=new t.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/agent/route",pathname:"/api/agent",filename:"route",bundlePath:"app/api/agent/route"},resolvedPagePath:"D:\\Web dev projects\\Car Suggestion Agent\\app\\api\\agent\\route.js",nextConfigOutput:"",userland:i}),{requestAsyncStorage:k,staticGenerationAsyncStorage:V,serverHooks:E}=P,q="/api/agent/route";function D(){return(0,o.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:V})}},9953:(e,r,a)=>{"use strict";a.d(r,{P:()=>o,ai:()=>s});var i=a(8954);let t=process.env.GEMINI_API_KEY;if(!t)throw Error("GEMINI_API_KEY is not configured.");let s=new i.fA({apiKey:t}),o="gemini-3.6-flash"},8957:(e,r,a)=>{"use strict";a.d(r,{Q:()=>l});var i=a(9953);let t=["tatamotors.com","hyundai.com","marutisuzuki.com","mahindra.com","kia.com","toyotabharat.com","hondacarindia.com","skoda-auto.co.in","volkswagen.co.in","mgmotor.co.in","nissan.in","renault.co.in","jeep-india.com","citroen.in","byd.com","bmw.in","mercedes-benz.co.in","audi.in","volvocars.com"],s=["autocarindia.com","cardekho.com","carwale.com","zigwheels.com","cars24.com","spinny.com"];function o(e,r){return!!e&&r.some(r=>e===r||e.endsWith(`.${r}`))}let n=new Map;function c(e){return"string"!=typeof e?"":e.trim().toLowerCase().replace(/\s+/g," ")}async function l(e){try{let r=function(e){let r=c(e);if(!r)return null;let a=n.get(r);return a?Date.now()-a.timestamp>6e5?(console.log("[Web Cache] EXPIRED:",r),n.delete(r),null):(console.log("[Web Cache] HIT:",r),a.data):(console.log("[Web Cache] MISS:",r),null)}(e);if(r)return console.log("[Google Search] Returning cached result."),r;let a=await i.ai.models.generateContent({model:i.P,contents:e,config:{tools:[{googleSearch:{}}]}}),l=a.candidates?.[0]?.groundingMetadata||null,u=function(e){if(!e)return[];let r=e.groundingChunks||[],a=[];for(let e of r){let r=e?.web;r?.uri&&a.push({title:r.title||"Unknown source",url:r.uri})}return function(e=[]){return Array.isArray(e)?e.map(e=>{let r=function(e={}){let r="string"==typeof e.title?e.title.toLowerCase():"",a=function(e){if(!e||"string"!=typeof e)return null;try{return new URL(e).hostname.toLowerCase().replace(/^www\./,"")}catch{return null}}(e.url),i=`${r} ${a||""}`;return o(a,t)||t.some(e=>i.includes(e))?{tier:1,reliability:"official"}:o(a,s)||s.some(e=>i.includes(e))?{tier:2,reliability:"established"}:{tier:3,reliability:"other"}}(e);return{...e,...r}}).sort((e,r)=>e.tier-r.tier):[]}(Array.from(new Map(a.map(e=>[e.url,e])).values()))}(l),y={success:!0,text:a.text||"",sources:u,groundingMetadata:l},d=function(e={}){let r="string"==typeof e.text?e.text.trim():"",a=(Array.isArray(e.sources)?e.sources:[]).filter(e=>e&&"string"==typeof e.url).map(e=>({title:"string"==typeof e.title?e.title:"Unknown source",url:e.url,tier:"number"==typeof e.tier?e.tier:3,reliability:"string"==typeof e.reliability?e.reliability:"other"})),i=a.some(e=>1===e.tier),t=a.some(e=>2===e.tier);return{success:!0===e.success,answer:r,sources:a,metadata:{sourceCount:a.length,hasOfficialSource:i,hasEstablishedSource:t}}}(y);return function(e,r){let a=c(e);a&&(n.set(a,{data:r,timestamp:Date.now()}),console.log("[Web Cache] STORED:",a))}(e,d),console.log("[Google Search] Search completed."),console.log("[Google Search] Sources:",u),console.log("[Google Search] Normalized result:",{answerLength:d.answer?.length||0,sourceCount:d.metadata?.sourceCount||0,hasOfficialSource:d.metadata?.hasOfficialSource||!1,hasEstablishedSource:d.metadata?.hasEstablishedSource||!1,hasConflict:d.metadata?.hasConflict||!1}),d}catch(e){return console.error("[Google Search] Search failed:",e),{success:!1,error:e?.message||"Google Search failed."}}}}};var r=require("../../../webpack-runtime.js");r.C(e);var a=e=>r(r.s=e),i=r.X(0,[948,287],()=>a(6749));module.exports=i})();
import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const HERO_SCENES = [
  {
    id: "banditry", label: "ARMED BANDITRY",
    sub: "Armed groups terrorising Borgu communities daily",
    bg: ["#1a0000","#5c0a0a","#2a0505"],
    accent: "#ff2200", glow: "#ff220044",
    shapes: ["⬟","◈","⬡"],
    icon: "🔫", stat: "31 armed attacks reported in Q1 2026",
  },
  {
    id: "rustling", label: "CATTLE RUSTLING",
    sub: "Herders losing livelihoods across Borgu farmlands",
    bg: ["#0e0a00","#3d2200","#1a0f00"],
    accent: "#ff8800", glow: "#ff880044",
    shapes: ["◇","⬡","◈"],
    icon: "🐄", stat: "200+ cattle stolen — Wawa, Agwara, Babanna",
  },
  {
    id: "insurgency", label: "BOKO HARAM / ISWAP",
    sub: "Insurgent threats escalating in the northwestern corridor",
    bg: ["#000000","#0a001a","#050010"],
    accent: "#aa00ff", glow: "#aa00ff44",
    shapes: ["◈","⬟","◇"],
    icon: "💣", stat: "HIGH ALERT — Northwestern Nigeria",
  },
  {
    id: "conflict", label: "COMMUNAL CONFLICT",
    sub: "Farmer-herder violence destabilising Borgu communities",
    bg: ["#001200","#003a10","#001a08"],
    accent: "#00dd44", glow: "#00dd4444",
    shapes: ["⬡","◇","⬟"],
    icon: "⚔️", stat: "12 communal clashes documented — 2026",
  },
];

const COMMUNITIES = [
  { name:"New Bussa", lat:9.888, lng:4.510, starlink:true },
  { name:"Kainji", lat:10.020, lng:4.640, starlink:false },
  { name:"Wawa", lat:10.120, lng:4.380, starlink:false },
  { name:"Agwara", lat:10.200, lng:4.150, starlink:true },
  { name:"Babanna", lat:9.650, lng:4.280, starlink:false },
  { name:"Kosubosu", lat:9.750, lng:4.720, starlink:false },
  { name:"Shagunu", lat:9.550, lng:4.350, starlink:false },
  { name:"Yelwa", lat:10.300, lng:4.450, starlink:false },
  { name:"Gufanti", lat:9.800, lng:4.600, starlink:true },
  { name:"Konkoso", lat:9.720, lng:4.480, starlink:true },
  { name:"Kane", lat:9.950, lng:4.320, starlink:true },
  { name:"Pissa", lat:10.050, lng:4.550, starlink:true },
  { name:"Gbangban", lat:9.620, lng:4.420, starlink:false },
  { name:"Kpagya", lat:9.580, lng:4.550, starlink:false },
  { name:"Zumba", lat:10.150, lng:4.650, starlink:false },
];

const AGENCIES = [
  { code:"NPF-BRG-2026", name:"Nigeria Police Force", div:"Borgu Divisional HQ", icon:"👮", color:"#1a6bb5" },
  { code:"NSCDC-BRG-2026", name:"NSCDC Niger Command", div:"Borgu Area Office", icon:"🛡️", color:"#0a8a4a" },
  { code:"DSS-BRG-2026", name:"Dept. of State Services", div:"Borgu Intelligence Desk", icon:"🕵️", color:"#8a6a0a" },
  { code:"ARMY-31-2026", name:"Nigerian Army — 31 Arty Bde", div:"Tactical Operations", icon:"⚔️", color:"#3a7a1a" },
  { code:"BCSSI-ADMIN-001", name:"Borgu LGA Security Admin", div:"Coordination Centre", icon:"🏛️", color:"#c9a227" },
];

const CATEGORIES = [
  { id:"theft", label:"Theft / Robbery", icon:"🔓", color:"#e74c3c" },
  { id:"violence", label:"Violence / Assault", icon:"⚠️", color:"#c0392b" },
  { id:"suspicious", label:"Suspicious Activity", icon:"👁️", color:"#e67e22" },
  { id:"vandalism", label:"Vandalism", icon:"🔨", color:"#8e44ad" },
  { id:"kidnapping", label:"Kidnapping", icon:"🚨", color:"#c0392b" },
  { id:"cattle_rustling", label:"Cattle Rustling", icon:"🐄", color:"#d35400" },
  { id:"banditry", label:"Banditry / Armed Attack", icon:"🔫", color:"#922b21" },
  { id:"fire", label:"Fire Outbreak", icon:"🔥", color:"#e74c3c" },
  { id:"conflict", label:"Communal Conflict", icon:"⚔️", color:"#a93226" },
  { id:"insurgency", label:"Insurgency / Terrorism", icon:"💣", color:"#6c3483" },
  { id:"other", label:"Other Incident", icon:"📋", color:"#7f8c8d" },
];

const PRIORITIES = [
  { id:"critical", label:"Critical", color:"#c0392b", bg:"#fadbd8" },
  { id:"high", label:"High", color:"#e67e22", bg:"#fdebd0" },
  { id:"medium", label:"Medium", color:"#f39c12", bg:"#fef9e7" },
  { id:"low", label:"Low", color:"#27ae60", bg:"#eafaf1" },
];

const STATUSES = [
  { id:"pending", label:"Pending Review", color:"#7f8c8d" },
  { id:"investigating", label:"Under Investigation", color:"#2980b9" },
  { id:"resolved", label:"Resolved", color:"#27ae60" },
  { id:"escalated", label:"Escalated", color:"#c0392b" },
];

const SEED_INCIDENTS = [
  { id:"INC-2026-001", date:"2026-05-01", time:"14:30", category:"banditry", community:"Kosubosu", location:"Highway to Wawa", priority:"critical", status:"investigating", description:"Armed bandits blocked the highway and robbed commuters. One vehicle hijacked.", reporter:"Aminu Suleiman", contact:"09011223344", anonymous:false, victims:"12 commuters", witnesses:"Victims", suspects:"Armed men ~8", lat:9.750, lng:4.720 },
  { id:"INC-2026-002", date:"2026-04-28", time:"22:10", category:"suspicious", community:"Kainji", location:"Kainji Dam Road", priority:"medium", status:"pending", description:"Three unidentified men loitering around the power substation fence after dark.", reporter:"Musa Abubakar", contact:"08012345678", anonymous:false, victims:"0", witnesses:"Security guard", suspects:"Three men in dark clothing", lat:10.020, lng:4.640 },
  { id:"INC-2026-003", date:"2026-04-25", time:"06:45", category:"cattle_rustling", community:"Wawa", location:"Wawa Farmlands", priority:"critical", status:"escalated", description:"Over 40 cattle rustled from three farms overnight by armed group of ~15 men.", reporter:"Ibrahim Danladi", contact:"07098765432", anonymous:false, victims:"3 farmers", witnesses:"Farm workers", suspects:"Armed group from northern direction", lat:10.120, lng:4.380 },
  { id:"INC-2026-004", date:"2026-04-20", time:"11:00", category:"vandalism", community:"Agwara", location:"Government Primary School", priority:"medium", status:"resolved", description:"Classroom windows and doors broken. Chairs and blackboards destroyed.", reporter:"Fatima Bello", contact:"08087654321", anonymous:false, victims:"School", witnesses:"Nearby residents", suspects:"Unknown", lat:10.200, lng:4.150 },
  { id:"INC-2026-005", date:"2026-04-18", time:"19:30", category:"conflict", community:"Babanna", location:"Babanna Village Square", priority:"high", status:"resolved", description:"Clash between herders and farmers over crop destruction. Five persons injured.", reporter:"Anonymous", contact:"", anonymous:true, victims:"5 injured", witnesses:"Community members", suspects:"Fulani herdsmen group", lat:9.650, lng:4.280 },
  { id:"INC-2026-006", date:"2026-05-05", time:"03:20", category:"theft", community:"New Bussa", location:"Market Square", priority:"high", status:"investigating", description:"Motorcyclist snatched a handbag near main market entrance. Fled towards Kainji Road.", reporter:"Anonymous", contact:"", anonymous:true, victims:"1", witnesses:"Several market traders", suspects:"Male, mid-20s, red helmet", lat:9.888, lng:4.510 },
];

const genId = () => `INC-2026-${String(Math.floor(Math.random()*900)+100)}`;
const today = () => new Date().toISOString().split("T")[0];
const nowTime = () => new Date().toTimeString().slice(0,5);

// ─── BADGE COMPONENTS ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = STATUSES.find(x=>x.id===status)||STATUSES[0];
  return <span style={{ background:s.color+"22", color:s.color, border:`1px solid ${s.color}55`, borderRadius:4, padding:"2px 10px", fontSize:11, fontWeight:700, letterSpacing:0.5 }}>{s.label}</span>;
}
function PriorityBadge({ priority }) {
  const p = PRIORITIES.find(x=>x.id===priority)||PRIORITIES[2];
  return <span style={{ background:p.bg, color:p.color, border:`1px solid ${p.color}66`, borderRadius:4, padding:"2px 10px", fontSize:11, fontWeight:700 }}>{p.label.toUpperCase()}</span>;
}

// ─── LEAFLET MAP COMPONENT ───────────────────────────────────────────────────
function IncidentMap({ incidents, userLocation, agencyMode }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (mapInstanceRef.current) return;
    const loadLeaflet = () => {
      if (window.L) { initMap(); return; }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
      document.head.appendChild(link);
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
      script.onload = initMap;
      document.head.appendChild(script);
    };
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;
      const map = L.map(mapRef.current, { center:[9.9,4.5], zoom:9, zoomControl:true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:'© OpenStreetMap contributors', maxZoom:18
      }).addTo(map);
      mapInstanceRef.current = map;
      setMapReady(true);
    };
    loadLeaflet();
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const L = window.L;
    const map = mapInstanceRef.current;
    // Clear existing markers
    map.eachLayer(layer => { if (layer instanceof L.Marker || layer instanceof L.CircleMarker) map.removeLayer(layer); });
    // Add incident markers
    incidents.forEach(inc => {
      if (!inc.lat || !inc.lng) return;
      const cat = CATEGORIES.find(c=>c.id===inc.category);
      const prioColors = { critical:"#e74c3c", high:"#e67e22", medium:"#f39c12", low:"#27ae60" };
      const color = prioColors[inc.priority]||"#7f8c8d";
      const marker = L.circleMarker([inc.lat, inc.lng], {
        radius:10, fillColor:color, color:"#fff", weight:2, opacity:1, fillOpacity:0.85
      }).addTo(map);
      const coordsHtml = agencyMode ? `<br><small style='color:#888'>GPS: ${inc.lat?.toFixed(4)}, ${inc.lng?.toFixed(4)}</small>` : "";
      marker.bindPopup(`
        <div style='font-family:sans-serif;min-width:200px'>
          <b style='color:${color}'>${inc.id}</b><br>
          ${cat?.icon} <b>${cat?.label}</b><br>
          📍 ${inc.community} — ${inc.location}<br>
          📅 ${inc.date} ${inc.time}<br>
          <span style='background:${color}22;color:${color};padding:1px 6px;border-radius:3px;font-size:11px'>${inc.priority?.toUpperCase()}</span>
          ${coordsHtml}
        </div>
      `);
    });
    // Add user location if available
    if (userLocation) {
      const pulseIcon = L.divIcon({ className:"", html:`<div style='width:16px;height:16px;background:#00aaff;border:3px solid #fff;border-radius:50%;box-shadow:0 0 12px #00aaff88'></div>`, iconSize:[16,16] });
      L.marker([userLocation.lat, userLocation.lng], { icon:pulseIcon }).addTo(map)
        .bindPopup("<b>📡 Your Location</b><br>GPS captured for this report");
    }
    // Starlink zones
    COMMUNITIES.filter(c=>c.starlink).forEach(c => {
      L.circle([c.lat,c.lng], { radius:4000, color:"#00ff88", fillColor:"#00ff88", fillOpacity:0.06, weight:1, dashArray:"4 4" }).addTo(map);
    });
  }, [mapReady, incidents, userLocation, agencyMode]);

  return (
    <div style={{ position:"relative" }}>
      <div ref={mapRef} style={{ height:420, borderRadius:10, overflow:"hidden", border:"1px solid #1e2d45" }} />
      {!mapReady && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", background:"#0d1526", borderRadius:10 }}>
          <div style={{ color:"#c9a227", fontFamily:"Cinzel,serif", fontSize:14 }}>🗺️ Loading Map...</div>
        </div>
      )}
      {mapReady && (
        <div style={{ position:"absolute", top:12, right:12, background:"#111827ee", border:"1px solid #1e2d45", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#a89070" }}>
          <div style={{ marginBottom:4, fontFamily:"Cinzel,serif", color:"#c9a227", fontSize:11 }}>MAP LEGEND</div>
          {[["#e74c3c","Critical"],["#e67e22","High"],["#f39c12","Medium"],["#27ae60","Low"]].map(([c,l])=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              <div style={{ width:10, height:10, borderRadius:"50%", background:c, border:"2px solid #fff3" }} />
              <span>{l}</span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:6, paddingTop:6, borderTop:"1px solid #1e2d45" }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background:"#00ff88", opacity:0.5 }} />
            <span style={{ color:"#00ff88" }}>Starlink Zone</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HERO ANIMATION ──────────────────────────────────────────────────────────
function AnimatedHero({ setView }) {
  const [scene, setScene] = useState(0);
  const [fading, setFading] = useState(false);
  const [textVisible, setTextVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTextVisible(false);
      setTimeout(() => {
        setScene(s => (s+1) % HERO_SCENES.length);
        setFading(false);
        setTimeout(() => setTextVisible(true), 100);
      }, 700);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const s = HERO_SCENES[scene];

  return (
    <div style={{
      position:"relative", minHeight:"100dvh", display:"flex", flexDirection:"column",
      justifyContent:"center", overflow:"hidden",
      background:`radial-gradient(ellipse at 20% 50%, ${s.bg[1]} 0%, ${s.bg[0]} 60%, ${s.bg[2]} 100%)`,
      transition:"background 0.7s ease",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Cinzel:wght@400;600;700&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,400&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#060b14}::-webkit-scrollbar-thumb{background:#c9a227;border-radius:3px}
        @keyframes scanline{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px)}}
        @keyframes pulse-ring{0%{transform:scale(0.9);opacity:1}100%{transform:scale(2.2);opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}
        .nav-btn{background:none;border:none;cursor:pointer;padding:8px 16px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:1.5px;color:#7a8fa6;transition:all 0.2s;border-bottom:2px solid transparent}
        .nav-btn:hover,.nav-btn.active{color:#c9a227;border-bottom:2px solid #c9a227}
        .card{background:#111827;border:1px solid #1e2d45;border-radius:10px;padding:22px}
        .btn-primary{background:linear-gradient(135deg,#c9a227,#a07c1a);color:#060b14;border:none;padding:13px 28px;border-radius:8px;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:15px;letter-spacing:2px;cursor:pointer;transition:all 0.25s;text-transform:uppercase}
        .btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 24px #c9a22766}
        .btn-primary:active{transform:translateY(0)}
        .btn-danger{background:linear-gradient(135deg,#c0392b,#7b241c);color:#fff;border:none;padding:13px 28px;border-radius:8px;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:15px;letter-spacing:2px;cursor:pointer;transition:all 0.25s}
        .btn-danger:hover{transform:translateY(-2px);box-shadow:0 6px 24px #c0392b66}
        .btn-secondary{background:transparent;color:#c9a227;border:1px solid #c9a22755;padding:11px 22px;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:14px;letter-spacing:1px;cursor:pointer;transition:all 0.2s;text-transform:uppercase}
        .btn-secondary:hover{border-color:#c9a227;background:#c9a22711}
        .form-field{width:100%;background:#0a1220;border:1px solid #1e2d45;border-radius:8px;padding:11px 14px;color:#e8e0d0;font-size:15px;outline:none;transition:border 0.2s;font-family:'Source Serif 4',serif}
        .form-field:focus{border-color:#c9a227;box-shadow:0 0 0 3px #c9a22722}
        .form-label{display:block;font-family:'Rajdhani',sans-serif;font-size:12px;letter-spacing:2px;color:#7a8fa6;margin-bottom:6px;text-transform:uppercase}
        .incident-row{background:#0a1220;border:1px solid #1e2d45;border-radius:8px;padding:16px;margin-bottom:10px;cursor:pointer;transition:all 0.2s}
        .incident-row:hover{border-color:#c9a22766;background:#111827;transform:translateX(3px)}
        .modal-overlay{position:fixed;inset:0;background:#00000099;display:flex;align-items:center;justify-content:center;z-index:200;padding:16px;backdrop-filter:blur(4px)}
        .modal{background:#0d1526;border:1px solid #c9a22733;border-radius:14px;padding:28px;width:100%;max-width:680px;max-height:88vh;overflow-y:auto;animation:slideDown 0.3s ease}
        .section-title{font-family:'Cinzel',serif;font-size:20px;color:#c9a227;border-bottom:1px solid #c9a22733;padding-bottom:10px;margin-bottom:20px}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
        .mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:#060b14ee;border-top:1px solid #1e2d45;z-index:100;padding:8px 0;backdrop-filter:blur(12px)}
        .tab-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:6px 4px;color:#7a8fa6;font-family:'Rajdhani',sans-serif;font-size:10px;letter-spacing:1px;transition:all 0.2s}
        .tab-btn.active{color:#c9a227}
        .tab-btn .tab-icon{font-size:20px;transition:transform 0.2s}
        .tab-btn.active .tab-icon{transform:scale(1.2)}
        @media(max-width:700px){
          .grid-2{grid-template-columns:1fr}
          .desktop-nav{display:none!important}
          .mobile-nav{display:flex}
          .hero-title{font-size:28px!important}
          .hero-sub{font-size:14px!important}
          .main-content{padding-bottom:80px!important}
          .stat-grid{grid-template-columns:repeat(3,1fr)!important}
        }
      `}</style>

      {/* Animated BG shapes */}
      <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none" }}>
        {/* Diagonal lines */}
        {[...Array(6)].map((_,i)=>(
          <div key={i} style={{
            position:"absolute", top:0, left:`${i*18}%`, width:1, height:"100%",
            background:`linear-gradient(180deg, transparent, ${s.accent}33, transparent)`,
            opacity:0.4, animation:`scanline ${3+i*0.5}s linear infinite`, animationDelay:`${i*0.5}s`
          }} />
        ))}
        {/* Big glow orb */}
        <div style={{
          position:"absolute", right:"-5%", top:"10%", width:500, height:500,
          borderRadius:"50%", background:`radial-gradient(circle, ${s.glow} 0%, transparent 70%)`,
          transition:"background 0.7s ease"
        }} />
        {/* Floating icon */}
        <div style={{
          position:"absolute", right:"8%", top:"50%", transform:"translateY(-50%)",
          fontSize:"clamp(80px,15vw,160px)", opacity:fading?0:0.15,
          transition:"opacity 0.7s ease", animation:"float 6s ease-in-out infinite",
          filter:`drop-shadow(0 0 40px ${s.accent}66)`
       

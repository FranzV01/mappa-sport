const annoCorrente = new Date().getFullYear();
const urlFoglio = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSB3hRuuuzUhGho2Wr_c0KBa8BYYMyASu6n0DrQ8q_o3GU3aw4_oC2vEvhuVbtmqR3Z3y0C5Zgh8Dji/pub?output=csv'; 
const linkCrowdsourcingBase = "https://docs.google.com/forms/d/e/1FAIpQLScnl0Qz7286ghO6Rkb2UxugFHGaCU_gGVAljUdkbp95zqhr2g/viewform?usp=pp_url&entry.1326851473=";
const apiKeyWeather = '866509f6df466a06900222f7a9562854'; 

const sportIcons = { "Calcio": "⚽", "Pallacanestro": "🏀", "Pallavolo": "🏐", "Rugby": "🏉", "Pallamano": "🤾", "Pallanuoto": "🤽", "Hockey su ghiaccio": "🏒", "Football americano": "🏈", "Baseball": "⚾" };
const placeholderLogo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMTIgMmwtMTAgOWgxNHoiPjwvcGF0aD48Y2lyY2xlIGN4PSIxMiIgY3k9IjEzIiByPSI5Ij48L2NpcmNsZT48L3N2Zz4=";
const normalizeText = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";
const dizionarioBadge = {
    // ECCELLENZE (Priorità 1-10)
    "Elite": { html: "⭐", classe: "badge-elite", priorita: 1 },
    "Gloria": { html: "🏆", classe: "badge-gloria", priorita: 2 },
    "Pioniere": { html: "💎", classe: "badge-pioniere", priorita: 3 },
    "Secolare": { html: "📜", classe: "badge-secolare", priorita: 4 },
    / STRUTTURE E AMBIENTE (Priorità 10-20)
    "Cattedrale": { html: "🏟️", classe: "badge-cattedrale", priorita: 10 },
    "Vetta": { html: "🏔️", classe: "badge-vetta", priorita: 11 },
    "Nord": { html: "❄️", classe: "badge-nord", priorita: 12 },
    "Sud": { html: "🐧", classe: "badge-sud", priorita 13 },
    "Est": { html: "🌅", classe: "badge-est", priorita 14 },
    "Ovest": { html: "🌇", classe: "badge-ovest", priorita 15 },
    // CARATTERISTICHE (Priorità 20-40)
    "Isolano": { html: "🏝️", classe: "badge-isola", priorita: 20 },
    "Globetrotter": { html: "🌍", classe: "badge-globetrotter", priorita: 21 },
    "Portuale": { html: "⚓", classe: "badge-porto", priorita: 22 },
    "Enclave": { html: "📍", classe: "badge-enclave", priorita: 23 },
    // STATO E CATEGORIE (Priorità 40+)
    "Femminile": { html: "♀", classe: "badge-femminile", priorita: 40 },
    "New Entry": { html: "✨", classe: "badge-newentry", priorita: 41 },
    "Riserva": { html: "B", classe: "badge-riserva", priorita: 50 },
    "Memoria": { html: "⚰️", classe: "badge-memoria", priorita: 60 }
};

function getLogoPerAnno(marker, annoSelezionato) {
    // Se la timeline è su "Tutti i tempi" o l'anno è il futuro
    if (annoSelezionato >= annoCorrente) return marker.dati.logo_attuale;

    // Cerca se esiste un logo storico per quell'anno specifico
    const logoTrovato = marker.storicoLoghi.find(l => 
        annoSelezionato >= l.inizio && annoSelezionato <= l.fine
    );

    // Se lo trova restituisce quello, altrimenti il logo attuale
    return logoTrovato ? logoTrovato.url : marker.dati.logo_attuale;
}

function checkColorMatch(cellaColoriNomi, targetColor) {
    if (targetColor === "Tutti") return true;
    
    if (!cellaColoriNomi || cellaColoriNomi === 'N.D.' || cellaColoriNomi === '') return false;

    const listaColoriPuri = cellaColoriNomi.toLowerCase().split(',').map(c => c.trim());
    const coloreCercato = targetColor.toLowerCase();

   const mapping = {
    'red': 'rosso',
    'amaranto': 'amaranto',
    'maroon': 'granata',
    'bordeaux': 'bordeaux',
    'orange': 'arancione',
    'gold': 'oro',
    'amber': 'ambra',
    'yellow': 'giallo',
    'lime': 'verde chiaro',
    'green': 'verde',
    'darkgreen': 'verde scuro',
    'skyblue': 'celeste',
    'lightblue': 'azzurro',
    'blue': 'blu',
    'navy': 'blu navy',
    'purple': 'viola',
    'fuchsia': 'fucsia',
    'pink': 'rosa',
    'lilac': 'lilla',
    'brown': 'marrone',
    'white': 'bianco',
    'grey': 'grigio',
    'black': 'nero'
};

    const nomeTradotto = mapping[coloreCercato] || coloreCercato;

    // Verifica se il colore cercato (o la sua traduzione) è nella lista
    return listaColoriPuri.includes(nomeTradotto) || listaColoriPuri.includes(coloreCercato);

    const matchColore = checkColorMatch(m.dati.colori_nomi, filtroColoreAttivo);
}

function generaLegendaBadge() {
    // Cerchiamo il pezzetto di HTML che abbiamo appena creato
    const container = document.getElementById('legenda-badge-dinamici'); 
    
    // Se non lo trova, usciamo per non mandare in crash il sito
    if (!container) {
        console.log("Errore: Non trovo il contenitore della legenda!");
        return;
    }

    let htmlLegenda = ''; 

    // Usiamo il dizionario che hai creato prima
    Object.keys(dizionarioBadge).forEach(key => {
        const b = dizionarioBadge[key];
        htmlLegenda += `
            <div class="legend-item">
                <div class="legend-icon ${b.classe}">${b.html}</div>
                <span><b>${key}</b></span>
            </div>`;
    });

    // Scriviamo i badge dentro il contenitore
    container.innerHTML = htmlLegenda;
}

var osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' });
var dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CartoDB' });
var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: '© Esri' });
var heatLayer = L.heatLayer([], { radius: 25, blur: 15, maxZoom: 10 });

var hash = window.location.hash.substring(1).split('/');
var startCenter = hash.length === 3 ? [hash[1], hash[2]] : [45, 10];
var startZoom = hash.length === 3 ? hash[0] : 5;

function checkNightShift() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return dark;
    return osm;
}

var map = L.map('map', { 
    layers: [checkNightShift()], 
    zoomControl: false, 
    dragging: !L.Browser.mobile, 
    tap: !L.Browser.mobile,
    // --- MODIFICHE PER MAPPA INFINITA ---
    worldCopyJump: true,      // Fa sì che i marker appaiano anche "dall'altra parte" quando scorri
    minZoom: 2,               // Impedisce di rimpicciolire troppo e vedere troppi mondi
    maxBounds: [[-85, -500], [85, 500]], // Blocca solo Nord/Sud, ma lascia spazio infinito a Est/Ovest
    maxBoundsViscosity: 0.8
}).setView(startCenter, startZoom);

// --- FIX RIPRISTINO STATO BADGE AL CARICAMENTO ---
const savedBadgeStatus = localStorage.getItem('autoBadgeStatus');
const mapEl = document.getElementById('map');
const toggleEl = document.getElementById('auto-badge-toggle');

if (savedBadgeStatus !== null) {
    const isVisible = savedBadgeStatus === 'true';
    if (toggleEl) toggleEl.checked = isVisible;
    // Se è falso, aggiungiamo subito la classe per nasconderli
    if (!isVisible) mapEl.classList.add('hide-badges');
}

map.on('moveend', function() {
    var center = map.getCenter();
    window.history.replaceState(null, null, `#${map.getZoom()}/${center.lat.toFixed(4)}/${center.lng.toFixed(4)}`);
    localStorage.setItem('lastPos', JSON.stringify({lat: center.lat, lng: center.lng, zoom: map.getZoom()}));
});

var baseMaps = { "Standard": osm, "Dark Mode 🌙": dark, "Satellite 🛰️": satellite };
var overlayMaps = { "Heatmap 🔥": heatLayer };
L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);
L.control.zoom({ position: 'bottomright' }).addTo(map);

var markersLayer = L.featureGroup();
var markers = L.markerClusterGroup({ 
    disableClusteringAtZoom: 17, 
    showCoverageOnHover: false,
    iconCreateFunction: function(cluster) {
        return L.divIcon({ html: `<div class="cluster-modern">${cluster.getChildCount()}</div>`, className: 'custom-cluster-icon', iconSize: L.point(40, 40) });
    }
});

var oms = new OverlappingMarkerSpiderfier(map, { keepSpiderfied: true, nearbyDistance: 30 });
var allMarkers = [];
var visibiliAttualmente = [];
var popup = L.popup({ className: 'custom-popup' });
var precisionCircle = null;
var tourInterval = null;
var filtroColoreSociale = "Tutti";

const normalizeText = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() : "";

function togglePanel() {
    const panel = document.getElementById('ui-panel');
    const btn = document.getElementById('toggle-panel-btn');
    panel.classList.toggle('collapsed');
    const isCollapsed = panel.classList.contains('collapsed');
    btn.style.display = isCollapsed ? 'flex' : 'none';
    localStorage.setItem('panelCollapsed', isCollapsed);
}

if (window.innerWidth < 768) setTimeout(togglePanel, 500);

function showNotification(msg) {
    const box = document.getElementById('notification');
    box.innerText = msg; box.style.display = 'block';
    setTimeout(() => { box.style.display = 'none'; }, 5000);
}

function addToHistory(club) {
    let history = JSON.parse(localStorage.getItem('mapSearchHistory') || '[]');
    history = history.filter(h => h.nome !== club.nome);
    history.unshift({ nome: club.nome, logo: club.logo_attuale });
    if (history.length > 5) history.pop();
    localStorage.setItem('mapSearchHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('mapSearchHistory') || '[]');
    const container = document.getElementById('search-history');
    if(!container) return;
    container.innerHTML = history.map(h => `
        <div class="history-item" onclick="vaiAClub('${h.nome.replace(/'/g, "\\'")}')" title="${h.nome}">
            <img src="${h.logo}" onerror="this.src='${placeholderLogo}';">
        </div>
    `).join('');
}

async function updateWeather(lat, lng, elementId) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKeyWeather}&units=metric&lang=it`);
        const data = await response.json();
        const el = document.getElementById(elementId);
        if (el && data.main) el.innerHTML = `🌤️ Meteo: <b>${data.weather[0].description}</b> | 🌡️ <b>${Math.round(data.main.temp)}°C</b>`;
    } catch (e) { console.log("Errore meteo"); }
}

window.toggleAutoBadges = function() {
    const mapEl = document.getElementById('map');
    const isChecked = document.getElementById('auto-badge-toggle').checked;
    
    // Ora usa la classe generica 'hide-badges' che controlla TUTTI i badge
    if (isChecked) {
        mapEl.classList.remove('hide-badges');
    } else {
        mapEl.classList.add('hide-badges');
    }
    
    // Salva la preferenza così al refresh non si resetta
    localStorage.setItem('autoBadgeStatus', isChecked);
};

window.toggleRiserve = function(mostra) {
    // Salviamo la preferenza
    localStorage.setItem('mostraRiserveStatus', mostra);
    // Riapplichiamo i filtri: la logica inserita sopra nasconderà i marker
    applicaFiltri();
    
    if (typeof showNotification === "function") {
        showNotification(mostra ? "Squadre riserva mostrate" : "Squadre riserva nascoste");
    }
};

window.setFiltroColore = function(colore, el) {
    filtroColoreSociale = colore;
    
    // Gestione visiva dei cerchietti
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        // Se stiamo ripristinando al caricamento, cerchiamo il cerchietto tramite title o attributo
        const target = document.querySelector(`.color-circle[onclick*="'${colore}'"]`);
        if (target) target.classList.add('active');
    }

    // NUOVO: Salva la scelta del colore
    localStorage.setItem('selectedColorFilter', colore);
    
    applicaFiltri();
};

window.toggleRanking = function(tipo) {
    const sidebar = document.getElementById('ranking-sidebar');
    const content = document.getElementById('ranking-content');
    const title = document.getElementById('ranking-title');
    const btnMore = document.getElementById('btn-show-more-rank');
    sidebar.style.display = 'block';

    let dati = [...allMarkers].map(m => m.dati);
    let label = "";

    if(tipo === 'pionieri') {
        label = "I Pionieri (Anzianità)";
        dati.sort((a,b) => (parseInt(String(a.fondazione).replace(/\D/g,''))||9999) - (parseInt(String(b.fondazione).replace(/\D/g,''))||9999));
    } else if(tipo === 'nuvole') {
        label = "Giganti delle Nuvole (Alt.)";
        dati.sort((a,b) => (parseInt(b.altitudine)||0) - (parseInt(a.altitudine)||0));
    } else if(tipo === 'cattedrali') {
        label = "Stadi Cattedrale (Capienza)";
        dati.sort((a,b) => (parseInt(b.capacita_stadio)||0) - (parseInt(a.capacita_stadio)||0));
    } else if(tipo === 're') {
        label = "Re del Mondo (Titoli Int.)";
        dati.sort((a,b) => (parseInt(b.trofei_internazionali)||0) - (parseInt(a.trofei_internazionali)||0));
    }

    title.innerText = label;
    const renderList = (limit) => {
        content.innerHTML = dati.slice(0, limit).map((d, i) => `
            <div class="ranking-item" onclick="vaiAClub('${d.nome.replace(/'/g, "\\'")}')">
                <span class="rank-pos">${i+1}</span>
                <img src="${d.logo_attuale}" width="20" height="20" style="object-fit:contain" onerror="this.src='${placeholderLogo}';">
                <span>${d.nome}</span>
                <span class="rank-val">
                ${tipo==='nuvole' ? new Intl.NumberFormat('it-IT').format(parseInt(d.altitudine)||0) + 'm' : 
                (tipo==='cattedrali' ? new Intl.NumberFormat('it-IT').format(parseInt(d.capacita_stadio)||0) : 
                (tipo==='pionieri' ? d.fondazione : d.trofei_internazionali))}
                </span>
            </div>
        `).join('');
    };
    renderList(10);
    btnMore.style.display = dati.length > 10 ? 'block' : 'none';
    btnMore.onclick = () => { renderList(25); btnMore.style.display = 'none'; };
};

document.addEventListener('keydown', function(e) {
    // Scorciatoia Shift + / (Nota: il tasto '/' con lo shift viene visto spesso come '?' o '/')
    if (e.shiftKey && (e.key === '/' || e.key === '?')) { 
        e.preventDefault(); 
        
        const panel = document.getElementById('ui-panel');
        const searchInput = document.getElementById('search-input');
        const btn = document.getElementById('toggle-panel-btn');
        
        // FORZA APERTURA se il pannello è chiuso
        if (panel.classList.contains('collapsed')) {
            panel.classList.remove('collapsed');
            if (btn) btn.style.display = 'none'; 
            localStorage.setItem('panelCollapsed', 'false'); 
        }

        // Focus sulla barra di ricerca
        setTimeout(() => {
            searchInput.focus();
        }, 100); 
        
        showNotification("Ricerca attivata 🔍");
    }
});

map.on('popupopen', function(e) {
    var marker = e.popup._source;
    if (marker && marker.dati) {
        let coloriArray = marker.dati.colori ? marker.dati.colori.split(',') : ['#333'];
        let wrapper = e.popup.getElement().querySelector('.leaflet-popup-content-wrapper');
        wrapper.style.border = `4px solid ${coloriArray[0]}`;
        const weatherId = `weather-${marker.dati.nome.replace(/\s/g, '')}`;
        updateWeather(marker.getLatLng().lat, marker.getLatLng().lng, weatherId);
        addToHistory(marker.dati);
    }
});

window.vaiAClub = function(nomeClub) {
    map.closePopup();
    const target = allMarkers.find(m => m.dati.nome.trim() === nomeClub.trim());
    if(target) {
        map.flyTo(target.getLatLng(), 16);
        map.once('moveend', function() {
            setTimeout(() => { popup.setContent(target.descrizione).setLatLng(target.getLatLng()).openOn(map); }, 100);
        });
    }
};

function resetFiltri() {
    // 1. Pulizia Totale del LocalStorage (Elimina ogni "ricordo" di filtri passati)
    localStorage.removeItem('mapFilters');
    localStorage.removeItem('mapSavedColor');
    localStorage.removeItem('selectedColorFilter');

    // 2. Reset variabili globali
    filtroColoreSociale = "Tutti";

    // 3. Reset fisico degli elementi UI nel pannello
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    const timelineSlider = document.getElementById('timeline-slider');
    const yearDisplay = document.getElementById('year-display');
    if (timelineSlider) {
        timelineSlider.value = annoCorrente;
        if (yearDisplay) yearDisplay.innerText = "Tutti i tempi";
    }

    // Riporta tutti i menu a tendina su "Tutti"
    document.querySelectorAll('#ui-panel select').forEach(sel => {
        sel.value = 'Tutti';
    });

    // 4. Reset visivo dei cerchietti colore
    document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
    const resetCircle = document.querySelector('.color-circle[title="Reset"]') || 
                        document.querySelector('.color-circle[onclick*="Tutti"]');
    if (resetCircle) resetCircle.classList.add('active');

    // 5. Chiudi i popup aperti
    map.closePopup();

    // 6. IL TOCCO FINALE: Chiamiamo l'unica funzione che conta e filtra
    // Essendo i campi sopra tutti svuotati, mostrerà TUTTO ricalcolando i numeri correttamente
    applicaFiltri();

    // 7. Notifica
    showNotification("Mappa ripristinata correttamente");
}

function clubCasuale() {
    map.closePopup();
    if (visibiliAttualmente.length === 0) return;
    const randomMarker = visibiliAttualmente[Math.floor(Math.random() * visibiliAttualmente.length)];
    map.flyTo(randomMarker.getLatLng(), 16); 
    map.once('moveend', () => { popup.setContent(randomMarker.descrizione).setLatLng(randomMarker.getLatLng()).openOn(map); });
}

function toggleTour() {
    const btn = document.getElementById('btn-tour');
    if (tourInterval) {
        clearInterval(tourInterval); tourInterval = null;
        btn.innerText = "▶ Tour"; btn.style.background = "";
        showNotification("Tour interrotto.");
    } else {
        if (visibiliAttualmente.length === 0) return;
        showNotification("Avvio Tour Automatico (5s per club)");
        btn.innerText = "⏹ Stop"; btn.style.background = "#ffcccc";
        tourInterval = setInterval(() => {
            const target = visibiliAttualmente[Math.floor(Math.random() * visibiliAttualmente.length)];
            map.flyTo(target.getLatLng(), 16);
            setTimeout(() => { popup.setContent(target.descrizione).setLatLng(target.getLatLng()).openOn(map); }, 1000);
        }, 6000);
    }
}

function filtraVicinanza() {
    const center = map.getCenter();
    const raggio = 50000; 
    markers.clearLayers(); markersLayer.clearLayers();
    visibiliAttualmente = allMarkers.filter(m => center.distanceTo(m.getLatLng()) <= raggio);
    visibiliAttualmente.forEach(m => markersLayer.addLayer(m));
    map.addLayer(markersLayer);
    showNotification(`Mostrati ${visibiliAttualmente.length} club nel raggio di 50km`);
}

window.toggleLoghi = function(btn) {
    const container = btn.previousElementSibling;
    const isHidden = container.style.display !== "flex";
    container.style.display = isHidden ? "flex" : "none";
    btn.innerText = isHidden ? "comprimi ▲" : "mostra altri ▼";
};

Papa.parse(urlFoglio, {
    download: true, header: true,
    complete: function(results) {
        document.getElementById('loader').style.display = 'none';
        const data = results.data;
        
        const oldestByNation = {};
        data.forEach(s => {
            if(!s.nazione || !s.fondazione) return;
            const year = parseInt(String(s.fondazione).replace(/\D/g, '')) || 9999;
            if (!oldestByNation[s.nazione] || year < oldestByNation[s.nazione].year) {
                oldestByNation[s.nazione] = { year: year, nome: s.nome };
            }
        });

        const nazioni = [...new Set(data.map(s => s.nazione))].filter(n => n).sort();
        nazioni.forEach(n => {
            let opt = document.createElement('option'); opt.value = opt.innerText = n;
            document.getElementById('filter-nazione').appendChild(opt);
        });

        document.getElementById('filter-nazione').addEventListener('change', function() {
            const nVal = this.value;
            setTimeout(() => {
                if (nVal !== "Tutti" && visibiliAttualmente.length > 0) {
                    let bounds = L.latLngBounds(visibiliAttualmente.map(m => m.getLatLng()));
                    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 6 });
                }
            }, 50);
        });

        const savedFilters = JSON.parse(localStorage.getItem('mapFilters') || '{}');
        Object.keys(savedFilters).forEach(id => {
            const el = document.getElementById(id);
            if(el && id !== 'cluster-enabled') el.value = savedFilters[id];
        });
        if (savedFilters['cluster-enabled'] !== undefined) document.getElementById('cluster-toggle').checked = savedFilters['cluster-enabled'];

        renderHistory();

        data.forEach((s, index) => {
    if(!s.lat || !s.lng) return;
    
    // --- OTTIMIZZAZIONE CARICAMENTO ---
    if (index % 50 === 0) document.getElementById('loader-progress').style.width = (index / data.length * 100) + '%';

    let coloriArray = s.colori ? s.colori.split(',') : ['#333'];
    let borderStyle = coloriArray.length > 1 ? `linear-gradient(45deg, ${coloriArray.join(',')})` : coloriArray[0];

    const isOldest = oldestByNation[s.nazione] && oldestByNation[s.nazione].nome === s.nome;
    const annoFondazione = parseInt(String(s.fondazione).replace(/\D/g, '')) || 9999;
    const isSquadraNuova = (annoFondazione === annoCorrente);
    const isScomparso = s.stato === "scomparso";
    const capStadio = parseInt(s.capacita_stadio) || 0;
    const altitudine = parseInt(s.altitudine) || 0;
    const livLega = parseInt(s.livello_lega) || 0;
    const trofeiInt = parseInt(s.trofei_internazionali) || 0;

    let badgeDaMostrare = [];

    // --- 1. BADGE DA EXCEL ---
    if (s.badge && s.badge.trim() !== "") {
        const daExcel = s.badge.split(',').map(b => b.trim().toLowerCase());
        daExcel.forEach(nomeMin => {
            const chiave = Object.keys(dizionarioBadge).find(k => k.toLowerCase() === nomeMin);
            if (chiave) badgeDaMostrare.push({ ...dizionarioBadge[chiave], titolo: chiave });
        });
    }
                     
    // --- 2. BADGE AUTOMATICI ---
    if (s.genere && s.genere.toLowerCase() === 'f') 
        badgeDaMostrare.push({ ...dizionarioBadge["Femminile"], titolo: "Femminile" });

    const isRiserva = /\s(B|2|II|U23)$/i.test(s.nome);
    if (isRiserva) 
        badgeDaMostrare.push({ ...dizionarioBadge["Riserva"], titolo: "Squadra Riserva" });

    if (isOldest) 
        badgeDaMostrare.push({ ...dizionarioBadge["Pioniere"], titolo: "Pioniere" });

    if (isSquadraNuova) 
        badgeDaMostrare.push({ ...dizionarioBadge["New Entry"], titolo: "New Entry" });

    if (isScomparso) 
        badgeDaMostrare.push({ ...dizionarioBadge["Memoria"], titolo: "Memoria" });

    if (trofeiInt > 0) 
        badgeDaMostrare.push({ ...dizionarioBadge["Gloria"], titolo: "Gloria" });

    if (annoFondazione <= (new Date().getFullYear() - 100)) {
        if (!badgeDaMostrare.find(b => b.titolo === "Secolare")) {
            badgeDaMostrare.push({ ...dizionarioBadge["Secolare"], titolo: "Secolare" });
        }
    }

    if (capStadio >= 50000) 
        badgeDaMostrare.push({ ...dizionarioBadge["Cattedrale"], titolo: "Cattedrale" });

    if (livLega === 1) 
        badgeDaMostrare.push({ ...dizionarioBadge["Elite"], titolo: "Elite" });

    if (altitudine > 2000) 
        badgeDaMostrare.push({ ...dizionarioBadge["Vetta"], titolo: "Vetta" });

    // --- 3. ORDINAMENTO E GENERAZIONE HTML ---
    badgeDaMostrare.sort((a, b) => (a.priorita || 99) - (b.priorita || 99));
    
    let badgesHTML = '';
    const totaleB = badgeDaMostrare.length;
    badgeDaMostrare.forEach((badge, i) => {
        const angolo = (i * (360 / totaleB)) - 90;
        badgesHTML += `<div class="badge-icon ${badge.classe}" style="--angle: ${angolo}deg;" title="${badge.titolo}">${badge.html}</div>`;
    });

    // --- 4. CREAZIONE MARKER ---
    let highlightClass = (s.highlight && s.highlight.toUpperCase() === 'SI') ? 'highlight-active' : '';

    var marker = L.marker([parseFloat(s.lat), parseFloat(s.lng)], {
        icon: L.divIcon({
            className: 'custom-div-icon',
            html: `<div class="logo-container ${highlightClass}" style="background: ${borderStyle};">
                     ${badgesHTML}
                     <img src="${s.logo_attuale}" class="logo-img-inner" loading="lazy" onerror="this.src='${placeholderLogo}';">
                   </div>`,
            iconSize: [44, 44], iconAnchor: [22, 22]
        })
    });

    marker.dati = s;
    marker.nomeNormalizzato = normalizeText(s.nome);
    marker.listaBadgeNomi = badgeDaMostrare.map(b => b.titolo);
    
    // Prosegui qui con marker.storicoLoghi e il resto del tuo codice...

            // --- LOGICA STORICO LOGHI PER TIMELINE ---
marker.storicoLoghi = [];
for (let i = 1; i <= 10; i++) {
    let url = s[`logo_storia_${i}_url`];
    let dateRange = s[`logo_storia_${i}_date`]; 
    if (url && dateRange && dateRange.includes('-')) {
        let parti = dateRange.split('-');
        marker.storicoLoghi.push({
            url: url,
            inizio: parseInt(parti[0].trim()) || 0,
            fine: parseInt(parti[1].trim()) || annoCorrente
        });
    }
}

            let flagHtml = s.codice_nazione ? `<img src="https://flagcdn.com/w40/${s.codice_nazione.toLowerCase()}.png" class="flag-icon">` : '';
            let emojiSport = sportIcons[s.sport] || "🏆"; 

            let precedentiHTML = '';

if (s.club_precedente && s.club_precedente.trim() !== "") {
    // Dividiamo la stringa in base alle virgole e puliamo gli spazi
    const listaPrecedenti = s.club_precedente.split(',').map(item => item.trim());

    listaPrecedenti.forEach(cp => {
        if (cp !== "") {
            // Cerchiamo se il club esiste nel database per prenderne il logo
            let clubTrovato = data.find(item => item.nome && item.nome.trim() === cp);
            let nomeEscaped = cp.replace(/'/g, "\\'");

            if (clubTrovato && clubTrovato.logo_attuale) {
                precedentiHTML += `
                    <div class="origin-wrapper" onclick="vaiAClub('${nomeEscaped}')" title="Vai a ${cp}">
                        <img src="${clubTrovato.logo_attuale}" class="origin-logo" loading="lazy" onerror="this.src='${placeholderLogo}';">
                        <span class="origin-name">${cp}</span>
                    </div>`;
            } else {
                // Se non c'è il logo, mostriamo il semplice pulsante link
                precedentiHTML += `<button class="btn-link-club" onclick="vaiAClub('${nomeEscaped}')">${cp}</button>`;
            }
        }
    });
}

            let loghiItems = [];
            for(let i=1; i<=10; i++) {
                let url = s[`logo_storia_${i}_url`];
                if(url) loghiItems.push(`<div class="storico-item"><img src="${url}" class="storico-img" loading="lazy" onerror="this.src='${placeholderLogo}';"><b>${s[`logo_storia_${i}_date`] || ''}</b></div>`);
            }

            let annivItems = [];
            for(let i=1; i<=5; i++) {
                let url = s[`logo_anniversario_${i}_url`];
                let dataA = s[`logo_anniversario_${i}_data`];
                if(url) annivItems.push(`<div class="anniversario-item"><img src="${url}" class="anniversario-img" loading="lazy" onerror="this.src='${placeholderLogo}';"><b>${dataA || ''}</b></div>`);
            }

            let wikiBtn = "";
            if (s.wiki && s.wiki.toLowerCase() === "si") {
                const wikiNome = s.nome.replace(/\s+/g, '_');
                wikiBtn = `<a href="https://en.wikipedia.org/wiki/${wikiNome}" target="_blank" class="btn-wiki">Wikipedia 📖</a>`;
            }

            // Generazione dei cerchietti
let coloriHTML = '';
if (s.colori_nomi) {
    const listaColori = s.colori_nomi.split(',').map(c => c.trim().toLowerCase());
    coloriHTML = '<div class="popup-colors">';
    listaColori.forEach(coloreIta => {
        // TRUCCO: sostituisce lo spazio con un trattino solo per la classe CSS
        // Esempio: "verde scuro" diventa "color-verde-scuro"
        const classeCSS = coloreIta.replace(/\s+/g, '-');
        coloriHTML += `<span class="color-dot color-${classeCSS}" title="${coloreIta}"></span>`;
    });
    coloriHTML += '</div>';
}
            
            const partiStadio = (s.stadio_nome || '').split(',');
            const nomeOriginale = partiStadio[0].trim();
            const nomeSponsor = partiStadio[1] ? partiStadio[1].trim() : null;
            const stadioDisplay = nomeSponsor
            ? `<b>${nomeOriginale}</b><br>· <i>${nomeSponsor}</i>`
            : `<b>${nomeOriginale || 'N.D.'}</b>`;
            
            marker.descrizione = `
                <div class="popup-card">
                    <div class="popup-header">
                        <h2 class="popup-title">${emojiSport} ${s.nome}</h2>
                        ${s.soprannome ? `<span class="popup-nickname">"${s.soprannome}"</span>` : ''}
                        ${coloriHTML}</div>
                    <div class="popup-info">
                        ${flagHtml} <b>${s.nazione}</b><br>
                        Fondazione: <b>${s.fondazione}</b><br>
                        Stadio: ${stadioDisplay}<br>
                        ${s.capacita_stadio ? `Posti: <b>${new Intl.NumberFormat('it-IT').format(parseInt(s.capacita_stadio))}</b>` : ''}
                    </div>
                    ${wikiBtn} ${precedentiHTML !== '' ? `<div class="precedenti-box"><span class="box-label">Club d'Origine</span><div class="precedenti-grid">${precedentiHTML}</div></div>` : ''}
                    ${annivItems.length > 0 ? `<div class="anniversario-box"><span class="box-label">Loghi Anniversario</span><div class="anniversario-grid">${annivItems.slice(0,3).join('')}</div>${annivItems.length > 3 ? `<div class="anniversario-grid hidden-logos">${annivItems.slice(3).join('')}</div><button class="btn-espandi" onclick="toggleLoghi(this)">mostra altri ▼</button>` : ''}</div>` : ''}
                    ${loghiItems.length > 0 ? `<div class="storici-container"><span class="box-label">Loghi Storici</span><div class="storico-grid">${loghiItems.slice(0,3).join('')}</div>${loghiItems.length > 3 ? `<div class="storico-grid hidden-logos">${loghiItems.slice(3).join('')}</div><button class="btn-espandi" onclick="toggleLoghi(this)">mostra altri ▼</button>` : ''}</div>` : ''}
                    <a href="${linkCrowdsourcingBase}${encodeURIComponent(s.nome)}" target="_blank" class="btn-update">Segnala aggiornamento/errore ✏️</a>
                </div>`;

            oms.addMarker(marker);
            allMarkers.push(marker);
        });

        window.applicaFiltri = function() {
            const sVal = normalizeText(document.getElementById('search-input').value);
            const nVal = document.getElementById('filter-nazione').value;
            const stVal = document.getElementById('filter-stato').value;
            const spVal = document.getElementById('filter-sport').value;
            const eVal = document.getElementById('filter-epoca').value;
            const gVal = document.getElementById('filter-genere').value;
            const cVal = document.getElementById('filter-capacita').value;
            const lVal = document.getElementById('filter-lega').value;
            const tVal = parseInt(document.getElementById('timeline-slider').value);
            const isClusterEnabled = document.getElementById('cluster-toggle').checked;
            const showReserves = document.getElementById('toggle-reserves') ? document.getElementById('toggle-reserves').checked : true;
            
            localStorage.setItem('mapFilters', JSON.stringify({
                'filter-nazione': nVal, 'filter-stato': stVal, 'filter-sport': spVal,
                'filter-epoca': eVal, 'filter-genere': gVal, 'timeline-slider': tVal,
                'cluster-enabled': isClusterEnabled, 'filter-capacita': cVal, 'filter-lega': lVal
            }));
 
            document.getElementById('year-display').innerText = tVal >= annoCorrente ? "Tutti i tempi" : "Fino al " + tVal;

            markers.clearLayers(); markersLayer.clearLayers();
            let heatPoints = [];
            let sportCounts = {};
            
            visibiliAttualmente = allMarkers.filter(m => {
                let ok = true;
                const anno = parseInt(String(m.dati.fondazione).replace(/\D/g, '')) || 0;
                const cap = parseInt(m.dati.capacita_stadio) || 0;

                if (sVal && !m.nomeNormalizzato.includes(sVal) && !normalizeText(m.dati.stadio_nome).includes(sVal)) ok = false;
                if (nVal !== "Tutti" && m.dati.nazione !== nVal) ok = false;
                if (stVal !== "Tutti" && m.dati.stato !== stVal) ok = false;
                if (spVal !== "Tutti" && m.dati.sport !== spVal) ok = false;
                if (gVal === "f" && (!m.dati.genere || m.dati.genere.toLowerCase() !== 'f')) ok = false;
                if (gVal === "m" && m.dati.genere && m.dati.genere.toLowerCase() === 'f') ok = false;
                if (tVal < annoCorrente && anno > tVal) ok = false;
                if (cVal === "small" && cap >= 15000) ok = false;
                if (cVal === "medium" && (cap < 15000 || cap >= 30000)) ok = false;
                if (cVal === "large" && (cap < 30000 || cap >= 50000)) ok = false;
                if (cVal === "giant" && cap < 50000) ok = false;
                if (lVal !== "Tutti" && parseInt(m.dati.livello_lega) !== parseInt(lVal)) ok = false;
                if (!checkColorMatch(m.dati.colori_nomi, filtroColoreSociale)) ok = false;
                const isRiserva = /\s(B|2|II|U23)$/i.test(m.dati.nome);
                if (!showReserves && isRiserva) ok = false;

                if(ok) {
                    heatPoints.push([m.getLatLng().lat, m.getLatLng().lng, 0.5]);
                    sportCounts[m.dati.sport] = (sportCounts[m.dati.sport] || 0) + 1;
                }
                return ok;
            });

            if (isClusterEnabled) {
                map.removeLayer(markersLayer); visibiliAttualmente.forEach(m => markers.addLayer(m)); map.addLayer(markers);
            } else {
                map.removeLayer(markers); visibiliAttualmente.forEach(m => markersLayer.addLayer(m)); map.addLayer(markersLayer);
            }

            // --- AGGIORNAMENTO DINAMICO LOGHI ---
visibiliAttualmente.forEach(m => {
    const iconEl = m.getElement();
    if (iconEl) {
        const img = iconEl.querySelector('.logo-img-inner');
        if (img) {
            const logoDaMostrare = getLogoPerAnno(m, tVal);
            // Cambia l'immagine solo se è diversa da quella attuale
            if (img.getAttribute('src') !== logoDaMostrare) {
                img.src = logoDaMostrare;
            }
        }
    }
});

            heatLayer.setLatLngs(heatPoints);
            document.getElementById('count-box').innerHTML = `Squadre filtrate: <b>${visibiliAttualmente.length}</b>`;
            document.getElementById('stats-breakdown').innerHTML = Object.entries(sportCounts).sort((a,b) => b[1] - a[1]).map(([n, c]) => `${sportIcons[n] || ''} ${c}`).join(' • ');
            
            if (sVal.length > 2 && visibiliAttualmente.length === 1) {
                const target = visibiliAttualmente[0];
                map.flyTo(target.getLatLng(), 16);
                map.once('moveend', () => { popup.setContent(target.descrizione).setLatLng(target.getLatLng()).openOn(map); });
            }
        };

        let searchTimeout;
        document.getElementById('search-input').oninput = () => {
            clearTimeout(searchTimeout); searchTimeout = setTimeout(applicaFiltri, 300);
        };

        const timelineSlider = document.getElementById('timeline-slider');
        const yearDisplay = document.getElementById('year-display');
        timelineSlider.oninput = () => { yearDisplay.classList.add('year-active'); applicaFiltri(); };
        timelineSlider.onchange = () => { yearDisplay.classList.remove('year-active'); };
        document.querySelectorAll('select').forEach(sel => sel.onchange = applicaFiltri);
        applicaFiltri();
    }
});

var LocateControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function (map) {
        var div = L.DomUtil.create('div', 'locate-btn');
        div.innerHTML = '<svg viewBox="0 0 24 24" width="20"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>';
        div.onclick = function(e){ e.stopPropagation(); map.locate({setView: true, maxZoom: 13}); };
        return div;
    }
});
map.addControl(new LocateControl());

map.on('locationfound', function(e) {
    if (precisionCircle) map.removeLayer(precisionCircle);
    precisionCircle = L.circle(e.latlng, { radius: e.accuracy, color: '#007bff', fillColor: '#007bff', fillOpacity: 0.15, weight: 2 }).addTo(map);
    let nearby = null; let minDist = 500; 
    allMarkers.forEach(m => {
        let dist = e.latlng.distanceTo(m.getLatLng());
        if (dist < minDist) { nearby = m.dati.nome; minDist = dist; }
    });
    showNotification(nearby ? `📍 Sei vicino allo stadio del ${nearby}!` : "📍 Posizione trovata!");
});

function onMarkerClick(a) {
    map.panTo(a.layer.getLatLng()); 
    popup.setContent(a.layer.descrizione).setLatLng(a.layer.getLatLng()).openOn(map);
}
markers.on('click', onMarkerClick);
markersLayer.on('click', onMarkerClick);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    const newLayer = e.matches ? dark : osm;
    map.removeLayer(osm); map.removeLayer(dark); map.addLayer(newLayer);
});

// Al caricamento della pagina, ripristina il colore salvato
const savedColor = localStorage.getItem('selectedColorFilter');
if (savedColor) {
    filtroColoreSociale = savedColor;
    // Aspetta un attimo che il DOM sia pronto per attivare il cerchietto
    setTimeout(() => {
        const targetCircle = document.querySelector(`.color-circle[onclick*="'${savedColor}'"]`);
        if (targetCircle) {
            document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('active'));
            targetCircle.classList.add('active');
        }
        applicaFiltri();
    }, 100);
}

// --- RIPRISTINO STATO PANNELLO AL CARICAMENTO ---
const savedPanelStatus = localStorage.getItem('panelCollapsed');
if (savedPanelStatus === 'true') {
    const panel = document.getElementById('ui-panel');
    const btn = document.getElementById('toggle-panel-btn');
    if (panel) panel.classList.add('collapsed');
    if (btn) btn.style.display = 'flex';
}

// Ripristino stato Switch Riserve
const savedReservesStatus = localStorage.getItem('mostraRiserveStatus');
const reservesToggle = document.getElementById('toggle-reserves');
if (savedReservesStatus !== null && reservesToggle) {
    reservesToggle.checked = (savedReservesStatus === 'true');
}

window.onload = () => { renderHistory(); };

// IMPORTANTE: Chiama la funzione alla fine del file script.js
generaLegendaBadge();

document.addEventListener("DOMContentLoaded", function() {
    const anno = new Date().getFullYear();
    const yearElements = document.querySelectorAll('.current-year-display');
    yearElements.forEach(el => {
        el.innerText = anno;
    });
});

/* ============================================================
   SÚPER OFERTAS DE NOVIEMBRE
   - Solo los productos de VISIBLES se muestran en catálogo y landings.
     Los demás siguen intactos en la lista original (ocultos, no borrados).
     Para volver a mostrar uno, basta con agregar su código aquí.
   - El precio de cada producto es el precio de oferta. El precio
     "antes" se calcula como precio + 15%.
   - La oferta y el contador terminan el 30 de noviembre a las 23:59
     (hora de Chile). Pasada esa fecha el banner se oculta solo y los
     productos quedan con su precio normal, sin tachado.
   ============================================================ */
window.SUPER_OFERTAS = {
    fin: new Date('2026-11-30T23:59:59-03:00').getTime(),
    recargoAntes: 1.15,           // antes valían un 15% más
    textoFin: '30 de noviembre',
    // código: precio de oferta (CLP)
    visibles: {
        '087': 81250,  // Mega Bouquet Rosas Fucsia con Gypsophila
        '075': 37500,  // Buqué Ternura Infinita — Margaritas Fucsia y Blancas
        '051': 62000,  // Buqué Rosas Rosadas con Mariposa y Corazón Plateado
        '053': 81000,  // Bouquet Bicolor Rosas Rojas y Blancas Premium
        '081': 25000,  // Buqué Clásico Eterno — 5 Rosas Rojas con Eucalipto
        '073': 35000,  // Buqué Clásico 12 Rosas Rojas con Tarjeta y Moño
        '036': 37990,  // Buqué Mixto Rosas Rojas y Rosadas
        '056': 16240,  // Bouquet Rosas Rojas con Pino y Detalle Dorado
        '031': 37990,  // Ramo Rústico Rosas Rojas
        '057': 17490,  // Bouquet de Gerberas Rosadas con Paniculata
        '072': 72000,  // Mega Bouquet Rosas Rojas y Rosadas en Papel Translúcido
        '005': 17990,  // Ramo Elegante 3 Rosas Rojas
        '064': 33000,  // Bouquet Sol Girasol con Rosas Amarillas y Mariposas
        '010': 23000,  // Buqué Clásico Rosas Rojas con Gypsophila
        '039': 43990,  // Ramo Premium 12 Rosas Rojas con Eucalipto
        '052': 44000,  // Mini Bouquet Rosas Rojas con Mariposa
        '006': 48000,  // Arreglo Fúnebre Oval Rosas Blancas
        '083': 31000,  // Palma Fúnebre Ovalada Blanca con Cala
        '020': 74988,  // Corona Fúnebre Blanca con Banda Pésame
        '019': 70000   // Arreglo Fúnebre Domo Blanco
    }
};

function superOfertasActiva() {
    return Date.now() < window.SUPER_OFERTAS.fin;
}

/* Devuelve solo los productos visibles, con el precio de oferta,
   el precio "antes" (+15%) y las etiquetas de rango de precio al día. */
function superOfertasAplicar(lista) {
    var cfg = window.SUPER_OFERTAS;
    var activa = superOfertasActiva();
    return lista.filter(function (p) {
        return Object.prototype.hasOwnProperty.call(cfg.visibles, p.code);
    }).map(function (p) {
        var precio = cfg.visibles[p.code];
        var cats = (p.categories || []).filter(function (c) {
            return c !== 'semana' && c.indexOf('precio-') !== 0;
        });
        cats.push(precio <= 30000 ? 'precio-bajo' : (precio <= 80000 ? 'precio-medio' : 'precio-alto'));
        var q = Object.assign({}, p, {
            price: precio,
            categories: cats,
            semana: false,
            funebrePromo: false,
            peluche: false,
            promo: activa,
            superOferta: activa
        });
        delete q.originalPrice;
        if (activa) q.originalPrice = Math.round(precio * cfg.recargoAntes / 10) * 10;
        return q;
    });
}

/* Oculta los botones de filtro que no tienen ningún producto visible */
function superOfertasAjustarFiltros(lista) {
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
        var f = btn.getAttribute('data-filter');
        if (!f || f === 'todos') return;
        var hay = lista.some(function (p) { return p.categories && p.categories.indexOf(f) !== -1; });
        btn.style.display = hay ? '' : 'none';
    });
}

/* ---------- Banner con contador grande ---------- */
function superOfertasTiempo() {
    var diff = window.SUPER_OFERTAS.fin - Date.now();
    if (diff <= 0) return null;
    return {
        d: Math.floor(diff / 86400000),
        h: Math.floor(diff / 3600000) % 24,
        m: Math.floor(diff / 60000) % 60,
        s: Math.floor(diff / 1000) % 60
    };
}

function superOfertasBannerHTML(ctaHref, ctaTexto) {
    var cfg = window.SUPER_OFERTAS;
    var etiquetas = { d: 'Días', h: 'Horas', m: 'Min', s: 'Seg' };
    var unidades = ['d', 'h', 'm', 's'].map(function (u, i) {
        return (i ? '<span class="so-sep" aria-hidden="true">:</span>' : '') +
               '<div class="so-unit"><span class="so-num" data-so="' + u + '">--</span>' +
               '<span class="so-lbl">' + etiquetas[u] + '</span></div>';
    }).join('');
    return '<div class="so-banner" role="region" aria-label="Súper ofertas hasta el ' + cfg.textoFin + '">' +
             '<div class="so-text">' +
               '<span class="so-kicker"><span class="so-dot"></span>Oferta por tiempo limitado</span>' +
               '<h2 class="so-title">¡Súper Ofertas<span> en todos nuestros arreglos!</span></h2>' +
               '<p class="so-sub">Antes costaban <strong>un 15% más</strong>. Hoy todo el catálogo está con precio rebajado, ' +
               'solo hasta el <strong>' + cfg.textoFin + '</strong>.</p>' +
             '</div>' +
             '<div class="so-timer">' +
               '<p class="so-timer-title">La oferta termina en</p>' +
               '<div class="so-countdown" data-so-cd>' + unidades + '</div>' +
               (ctaHref ? '<a class="so-cta" href="' + ctaHref + '">' + (ctaTexto || 'Ver ofertas') + ' →</a>' : '') +
             '</div>' +
           '</div>';
}

var superOfertasTimer = null;
function superOfertasIniciar() {
    var slots = document.querySelectorAll('[data-super-ofertas]');
    if (!slots.length) return;
    if (!superOfertasActiva()) {
        slots.forEach(function (s) { s.style.display = 'none'; });
        return;
    }
    slots.forEach(function (s) {
        s.innerHTML = superOfertasBannerHTML(s.getAttribute('data-cta-href'), s.getAttribute('data-cta-text'));
    });
    function tick() {
        var t = superOfertasTiempo();
        if (!t) {
            clearInterval(superOfertasTimer);
            slots.forEach(function (s) { s.style.display = 'none'; });
            return;
        }
        document.querySelectorAll('[data-so-cd] [data-so]').forEach(function (el) {
            var v = t[el.getAttribute('data-so')];
            var txt = v < 10 ? '0' + v : '' + v;
            if (el.textContent !== txt) el.textContent = txt;
        });
    }
    tick();
    superOfertasTimer = setInterval(tick, 1000);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', superOfertasIniciar);
} else {
    superOfertasIniciar();
}

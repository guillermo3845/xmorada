/* Xmorada — render de galerías + lightbox. Sin dependencias. */
(function () {
  "use strict";

  // Metadatos extra por sección (links de proyectos web, etc.)
  var SECTION_META = {
    "sitios-web-cctv-warehouse": {
      desc: 'CCTV Warehouse — Sistemas de Seguridad. Diseño integral · Logo · Web + Tienda online · Banners. ' +
            '<a href="https://www.cctvwarehousepr.com" target="_blank" rel="noopener">cctvwarehousepr.com ↗</a>'
    },
    "sitios-web-grupo-solar-pr": {
      desc: 'Grupo Solar PR — Energía Solar. Diseño integral · Logo · Web + Tienda online · Banners. ' +
            '<a href="https://www.gruposolarpr.com" target="_blank" rel="noopener">gruposolarpr.com ↗</a>'
    }
  };

  // Nombres de display curados (casing correcto, acrónimos, etc.)
  var DISPLAY = {
    "arte-y-cultura": "Arte y Cultura",
    "agricultura-y-naturaleza": "Agricultura y Naturaleza",
    "corporativos": "Corporativos",
    "videos": "Videos",
    "flyers-ig-fb-impreso": "Flyers · IG / FB / Impreso",
    "sitios-web-cctv-warehouse": "Sitios Web — CCTV Warehouse",
    "sitios-web-grupo-solar-pr": "Sitios Web — Grupo Solar PR",
    "logos-thematic-titles": "Logos y Títulos",
    "labels-stickers": "Labels y Stickers",
    "menu-maps-misc": "Menús, Mapas y Misceláneos",
    "tickets-business-cards": "Tickets y Tarjetas",
    "portadas-fotografia-diseno": "Portadas · Fotografía & Diseño",
    "libros-imagen-texto": "Libros · Imagen & Texto"
  };

  // Secciones que se muestran más chicas (formatos verticales / iconos)
  var TIGHT = { "libros-imagen-texto": true }; var ORDER = {"editorial":["libros-imagen-texto","portadas-fotografia-diseno"]}; var AUDIOS = [{t:"Audioguía Introducción Sunlight on the Sea Floor",src:"assets/audio/sunlight-on-the-sea-floor.mp3",img:"assets/img/audio/sunlight-on-the-sea-floor.png"},{t:"Audioguía para CARIBE POR VENIR",src:"assets/audio/caribe-por-venir.mp3",img:"assets/img/audio/caribe-por-venir.png"}]; function buildAudio(mount){var s=document.createElement("section");s.className="section";s.id="audioguias";s.innerHTML='<div class="section__head"><h2 class="section__title">Audioguías</h2><span class="section__count">'+AUDIOS.length+'</span></div><p class="section__desc">Museo de Arte Contemporáneo de Puerto Rico.</p>';var g=document.createElement("div");g.className="grid";AUDIOS.forEach(function(a){var w=document.createElement("div");w.style.cssText="break-inside:avoid;margin-bottom:14px";var t=document.createElement("a");t.className="tile video";t.href=a.src;t.setAttribute("aria-label",a.t);var im=document.createElement("img");im.alt=a.t;im.src=a.img;im.addEventListener("load",function(){im.classList.add("loaded")});t.appendChild(im);var p=document.createElement("p");p.style.cssText="margin:8px 0 6px;font-size:14px;color:var(--ink-dim)";p.textContent=a.t;var au=document.createElement("audio");au.controls=true;au.preload="none";au.src=a.src;au.style.cssText="width:100%;display:none";t.addEventListener("click",function(e){e.preventDefault();au.style.display="block";if(au.paused){au.play()}else{au.pause()}});w.appendChild(t);w.appendChild(p);w.appendChild(au);g.appendChild(w)});s.appendChild(g);mount.appendChild(s)}

  function label(sec) {
    return DISPLAY[sec.slug] || titleCase(sec.title);
  }
  function titleCase(s) {
    var small = { y:1, e:1, o:1, u:1, de:1, del:1, la:1, las:1, los:1, "&":1 };
    return s.toLowerCase().split(/\s+/).map(function (w, i) {
      if (i > 0 && small[w]) return w;
      return w.replace(/^([a-záéíóúñ])/, function (m) { return m.toUpperCase(); });
    }).join(" ");
  }

  var flat = [];        // lista plana para navegación en lightbox
  var videoCount = 0;   // índice para asignar links de XM_VIDEOS en orden

  // Convierte un link de YouTube/Vimeo en una URL para <iframe>. "" si no reconoce.
  function toEmbed(url) {
    url = (url || "").trim();
    if (!url) return "";
    var m;
    m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
    if (m) return "https://www.youtube.com/embed/" + m[1];
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return "https://player.vimeo.com/video/" + m[1];
    return "";
  }

  function buildPage() {
    var body = document.body;
    var pageId = body.getAttribute("data-page");
    var mount = document.getElementById("galleries");
    if (!pageId || !mount || !window.XM) return;

    var page = window.XM.pages.filter(function (p) { return p.id === pageId; })[0];
    if (!page) return;
    var isVideo = pageId === "video"; if (isVideo) { setTimeout(function () { buildAudio(mount); }, 0); }

    (ORDER[pageId] ? page.sections.slice().sort(function (a, b) { var o = ORDER[pageId]; function k(x) { var i = o.indexOf(x.slug); return i < 0 ? 99 : i; } return k(a) - k(b); }) : page.sections).forEach(function (sec) {
      if (!sec.images.length) return;
      var s = document.createElement("section");
      s.className = "section";

      var head = document.createElement("div");
      head.className = "section__head";
      head.innerHTML = '<h2 class="section__title">' + label(sec) +
        '</h2><span class="section__count">' + sec.images.length + '</span>';
      s.appendChild(head);

      var meta = SECTION_META[sec.slug];
      if (meta && meta.desc) {
        var d = document.createElement("p");
        d.className = "section__desc";
        d.innerHTML = meta.desc;
        s.appendChild(d);
      }

      var grid = document.createElement("div");
      grid.className = "grid" + (TIGHT[sec.slug] ? " tight" : "");

      sec.images.forEach(function (im) {
        var idx = flat.length;
        // asignar link de video en orden (solo en la pagina Video/Audio)
        if (isVideo) {
          var raw = (window.XM_VIDEOS || [])[videoCount++];
          var emb = raw ? toEmbed(raw) : "";
          if (emb) im.video = emb;
        }
        flat.push(im);
        var a = document.createElement("a");
        a.className = "tile" + (isVideo && im.video ? " video" : "");
        a.href = im.video || im.src;
        a.setAttribute("data-idx", idx);
        a.setAttribute("aria-label", im.alt || (im.video ? "Reproducir video" : "Ver imagen"));
        var img = document.createElement("img");
        img.loading = "lazy";
        img.alt = im.alt || ("Xmorada — " + sec.title);
        img.src = im.src;
        img.addEventListener("load", function () { img.classList.add("loaded"); });
        img.addEventListener("error", function () { a.style.display = "none"; });
        a.appendChild(img);
        a.addEventListener("click", function (e) { e.preventDefault(); openLB(idx); });
        grid.appendChild(a);
      });

      s.appendChild(grid);
      mount.appendChild(s);
    });
  }

  /* ---------- lightbox ---------- */
  var lb, lbImg, lbFrame, lbCap, cur = 0;
  var zoomed = false, zoomRect = null;
  function ensureLB() {
    if (lb) return;
    lb = document.createElement("div");
    lb.className = "lb";
    lb.innerHTML =
      '<button class="lb__btn lb__close" aria-label="Cerrar">×</button>' +
      '<button class="lb__btn lb__prev" aria-label="Anterior">‹</button>' +
      '<img alt="" draggable="false">' +
      '<div class="lb__video"><iframe allow="accelerator; autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe></div>' +
      '<button class="lb__btn lb__next" aria-label="Siguiente">›</button>' +
      '<div class="lb__cap"></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector("img");
    lbFrame = lb.querySelector(".lb__video");
    lbCap = lb.querySelector(".lb__cap");
    lb.querySelector(".lb__close").onclick = closeLB;
    lb.querySelector(".lb__prev").onclick = function () { step(-1); };
    lb.querySelector(".lb__next").onclick = function () { step(1); };
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLB(); });
    // zoom: clic sobre la foto amplía/reduce; el mouse la recorre
    lbImg.addEventListener("click", function (e) { e.stopPropagation(); toggleZoom(e); });
    lb.addEventListener("mousemove", function (e) { if (zoomed) panTo(e.clientX, e.clientY); });
    lbImg.addEventListener("touchmove", function (e) {
      if (zoomed && e.touches[0]) { panTo(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }
    }, { passive: false });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") { if (zoomed) zoomOut(); else closeLB(); }
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    });
  }
  function panTo(cx, cy) {
    if (!zoomRect) return;
    var x = Math.min(100, Math.max(0, (cx - zoomRect.left) / zoomRect.width * 100));
    var y = Math.min(100, Math.max(0, (cy - zoomRect.top) / zoomRect.height * 100));
    lbImg.style.transformOrigin = x + "% " + y + "%";
  }
  function zoomIn(e) {
    zoomRect = lbImg.getBoundingClientRect();   // caja ajustada (referencia para el paneo)
    zoomed = true;
    lbImg.classList.add("zoom");
    if (e) panTo(e.clientX, e.clientY);
  }
  function zoomOut() {
    zoomed = false; zoomRect = null;
    lbImg.classList.remove("zoom");
    lbImg.style.transformOrigin = "center center";
  }
  function toggleZoom(e) { if (zoomed) zoomOut(); else zoomIn(e); }
  function clearFrame() { lbFrame.querySelector("iframe").src = "about:blank"; }
  function show() {
    zoomOut();
    var im = flat[cur];
    if (im.video) {
      lbImg.style.display = "none";
      lbFrame.style.display = "block";
      lbFrame.querySelector("iframe").src = im.video + (im.video.indexOf("?") > -1 ? "&" : "?") + "autoplay=1";
    } else {
      clearFrame();
      lbFrame.style.display = "none";
      lbImg.style.display = "";
      lbImg.src = im.src;
      lbImg.alt = im.alt || "";
    }
    lbCap.textContent = im.alt || "";
  }
  function openLB(i) { ensureLB(); cur = i; show(); lb.classList.add("open"); document.body.style.overflow = "hidden"; }
  function closeLB() { zoomOut(); lb.classList.remove("open"); document.body.style.overflow = ""; clearFrame(); }
  function step(d) { cur = (cur + d + flat.length) % flat.length; show(); }

  /* ---------- mobile nav ---------- */
  function nav() {
    var t = document.querySelector(".nav-toggle");
    var n = document.querySelector(".nav");
    if (t && n) t.addEventListener("click", function () { n.classList.toggle("open"); });
  }

  document.addEventListener("DOMContentLoaded", function () { buildPage(); nav(); });
})();

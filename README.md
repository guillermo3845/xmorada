# Xmorada — sitio estático

Reconstrucción del sitio de Wix (xmorada.com) como sitio **estático y gratis**, para
hostear en GitHub Pages igual que coraroca.com.ar.

## Qué hay acá

```
site/
├── index.html            → Fotografía (home)
├── video-audio.html      → Video / Audio
├── diseno-grafico.html   → Diseño Gráfico
├── editorial.html        → Editorial
├── contacto.html         → Contacto (form abre mail a figoliar@gmail.com)
├── assets/
│   ├── style.css         → estilos
│   ├── gallery.js        → motor de galerías + lightbox
│   ├── data.js           → manifiesto: qué imágenes van en cada sección
│   └── img/              → (se llena al correr el paso 1)
├── download-images.sh    → baja las 271 imágenes originales de Wix
└── README.md
```

Las galerías se arman solas leyendo `assets/data.js`. Si algún día querés
sumar/sacar/reordenar fotos, editás ese archivo (o me lo pedís).

---

## Paso 1 — Bajar las imágenes (una sola vez)

Las fotos todavía viven en los servidores de Wix. Este script las baja a
`assets/img/` en **full-res** (el original, no la miniatura).

En la terminal, parado en la carpeta `site`:

```bash
cd site
bash download-images.sh
```

Tarda un rato (son 271 archivos). Si alguno falla, lo avisa y podés volver a
correr el script: los que ya bajaron se saltean.

## Paso 2 — Previsualizar en tu Mac

```bash
cd site
python3 -m http.server 8080
```

Y abrís http://localhost:8080 en el navegador. Revisá que no falte ninguna
imagen y que las secciones estén completas.

## Paso 3 — Subir a GitHub Pages

1. Creás un repo nuevo en GitHub (ej. `xmorada`).
2. Subís **el contenido de la carpeta `site`** (que `index.html` quede en la raíz del repo).
   ```bash
   cd site
   git init && git add . && git commit -m "Sitio estático Xmorada"
   git branch -M main
   git remote add origin https://github.com/guillermo3845/xmorada.git
   git push -u origin main
   ```
3. En el repo → **Settings → Pages → Build and deployment → Deploy from a branch**,
   elegís `main` / `/ (root)` y guardás.
4. En un par de minutos queda en `https://guillermo3845.github.io/xmorada/`.
   Probalo ahí antes de tocar el dominio.

## Paso 4 — Apuntar el dominio (recién cuando esté por vencer Wix)

Mientras el plan de Wix siga pago no hay apuro. Cuando quieras hacer el switch:

1. Creás un archivo llamado `CNAME` (sin extensión) en la raíz del repo, con una
   sola línea: `xmorada.com`
2. En Cloudflare (o donde tengas el DNS), apuntás a GitHub Pages:
   - Cuatro registros **A** en `@` → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153`
   - Un registro **CNAME** en `www` → `guillermo3845.github.io`
3. En Settings → Pages, en "Custom domain" ponés `xmorada.com` y activás **Enforce HTTPS**.

> Ojo: revisá primero **dónde está registrado el dominio** y su fecha de
> renovación (en Wix el dominio se renueva aparte del hosting). Esa fecha es la
> que importa para no perder xmorada.com.

---

## Pendientes / notas

- **Videos:** en la página Video/Audio quedaron las miniaturas. Los reproductores
  estaban embebidos en Wix y no se pueden recuperar del HTML. Pasame los enlaces
  de YouTube/Vimeo de cada uno y los dejo reproduciendo.
- **Formulario de contacto:** es "sin servidor" — al enviar abre el mail del
  visitante ya redactado hacia figoliar@gmail.com. Si preferís que llegue solo
  (sin abrir el cliente de mail), se conecta gratis con Formspree en 5 minutos.
- **Audioguías:** esa sección estaba vacía en Wix, así que no se incluyó.

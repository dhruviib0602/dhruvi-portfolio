# dhruv. — portfolio (React)

## Run it
1. Install Node.js (LTS) from https://nodejs.org
2. Open a terminal in this folder and run:
   npm install
   npm run dev
3. Open the link it prints (usually http://localhost:5173)

`npm run build` makes a `dist/` folder you can upload to Netlify or Vercel.

## Where things live
- src/styles/global.css   colours, grid, header, nav, footer (shared by every page)
- src/components/         Header, Footer, logo Mark, ScrambleText, GridLines, Lightbox
- src/lib/                InfiniteCanvas3D.js — the 3D floating-images engine (three.js)
- src/pages/              one file per page (+ its own .css)
- src/App.jsx             the list of routes (URLs)
- public/images/          all images (playground photos are in public/images/playground)

## Adding a playground image
1. Put the file in public/images/playground/ (e.g. 11.jpg)
2. Add a line to the IMAGES list at the top of src/pages/Playground.jsx:
   { src: '/images/playground/11.jpg', aspect: WIDTH / HEIGHT },

## Routes
/                               landing        ✅ done
/work                           work           ✅ done
  (edit projects — name, category, year, image, link — at the top of src/pages/Work.jsx;
   poster images live in public/images/work/)
/work/inclusive-navigation      case study     ✅ done
  (all text + image slots at the top of src/pages/InclusiveNavigation.jsx;
   put images in public/images/inclusive-navigation/ and set `image: '/images/inclusive-navigation/…'`)
/work/thela-thaila-thikana      case study     ⏳
/playground                     playground     ✅ done
/about                          about          ✅ done
  (edit bio, links and "things i like to" lines at the top of src/pages/About.jsx)

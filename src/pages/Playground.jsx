import { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import GridLines from '../components/GridLines';
import ScrambleText from '../components/ScrambleText';
import Lightbox from '../components/Lightbox';
import InfiniteCanvas3D from '../lib/InfiniteCanvas3D';
import './Playground.css';
import useTitle from '../hooks/useTitle';

// Your playground images live in public/images/playground/.
// To add one: drop the file in that folder and add a line here.
// `aspect` = width ÷ height, so the image isn't stretched in 3D.
const IMAGES = [
  { src: '/images/playground/1.jpg', aspect: 0.6519 },
  { src: '/images/playground/2.jpg', aspect: 0.5625 },
  { src: '/images/playground/3.jpg', aspect: 0.6664 },
  { src: '/images/playground/4.jpg', aspect: 0.5625 },
  { src: '/images/playground/5.jpg', aspect: 0.6813 },
  { src: '/images/playground/6.jpg', aspect: 1.4971 },
  { src: '/images/playground/7.jpg', aspect: 0.6664 },
  { src: '/images/playground/8.jpg', aspect: 0.6664 },
  { src: '/images/playground/9.jpg', aspect: 0.75 },
  { src: '/images/playground/10.jpg', aspect: 0.9219 },
];

export default function Playground() {
  useTitle('archive');
  const canvasRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(null);

  // Start the 3D canvas when the page mounts, tear it down when leaving.
  useEffect(() => {
    const canvas = new InfiniteCanvas3D(canvasRef.current, {
      chunkSize: 60,
      renderDistance: 1,
      itemsPerChunk: 4,
      images: IMAGES,
      onImageClick: (i) => setOpenIndex(i),
    });
    return () => {
      canvas.destroy();
    };
  }, []);

  return (
    <div className="page playground">
      <GridLines />

      <div className="fold">
        <div className="ic3d-fullbleed" ref={canvasRef} />

        <Header />

        <div className="playground-copy grid-row">
          <p className="pg-line">
            <ScrambleText text="a silly little space for things made without a brief, a stakeholder, or a five-step design process. Just posters, pictures, experiments," />
          </p>
          <p className="pg-line">
            <ScrambleText text="and whatever else seemed like a good idea" />
          </p>
          <p className="pg-line trailing">
            <ScrambleText text="at the time." />
          </p>
        </div>
      </div>

      <Lightbox
        images={IMAGES}
        index={openIndex}
        onChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
      />
    </div>
  );
}

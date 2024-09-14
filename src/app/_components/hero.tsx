import { getMyImages } from "~/server/queries";
import Image from 'next/image';
// export const runtime = "force-dynamic";

export default async function Hero() {
    const images = await getMyImages(); 
    console.log(images);

  return (
    <div className="hero">
      <div className="hero__container">
        <div className="hero__content">
          <h1 className="hero__title">Tricodex </h1>
          <p className="hero__description">
          Scaffold
           
          </p>
          <a
            href="
https://github.com/tricodex/selfdiscoverjarvis/tree/s2"
            className="hero__button"
          >
            Get Started
          </a>
        </div>
        <div className="hero__image flex flex-wrap gap-1">
            {images.map((image) => (
                <div key={image.id}>{image.name}
                <Image src={image.url} alt={image.name} width={48} height={24} />

                </div>))}
        </div>
      </div>
    </div>
  );
}
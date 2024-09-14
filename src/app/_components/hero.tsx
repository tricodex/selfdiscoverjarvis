import { db } from "~/server/db";

// export const runtime = "force-dynamic";

export default async function Hero() {
    const posts = await db.query.posts.findMany(); 
    console.log(posts);

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
            {posts.map((post) => (
                <div key={post.id}>{post.name}
                </div>))}
        </div>
      </div>
    </div>
  );
}
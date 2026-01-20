// STATIC SITE GENERATION (SSG) - generates at build time, cached
// Great for: Blog posts, documentation, product pages that don't change often

export default function SSGPage({ post }: { post: any }) {
  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <small>Built at: {post.buildTime}</small>
    </div>
  );
}

// This runs ONCE at build time
export async function getStaticProps({ params }: any) {
  const res = await fetch(`https://api.example.com/posts/${params.id}`);
  const post = await res.json();

  return {
    props: { post },
    revalidate: 60, // Revalidate every 60 seconds (ISR - Incremental Static Regeneration)
  };
}

// Pre-generate pages at build time
export async function getStaticPaths() {
  const res = await fetch('https://api.example.com/posts');
  const posts = await res.json();

  const paths = posts.map((post: any) => ({
    params: { id: post.id },
  }));

  return {
    paths,
    fallback: 'blocking', // Generate new pages on demand
  };
}

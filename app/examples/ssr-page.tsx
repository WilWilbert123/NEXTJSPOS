// SERVER-SIDE RENDERING (SSR) - fetches data on every request
// Great for: Dynamic content, real-time data, user-specific pages

export default function SSRPage({ data }: { data: any }) {
  return (
    <div>
      <h1>Server-Side Rendered Page</h1>
      <p>This page is rendered on every request with fresh data</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

// This runs on the SERVER on every request
export async function getServerSideProps() {
  try {
    const res = await fetch('https://api.example.com/data');
    const data = await res.json();

    return {
      props: { data },
      revalidate: false, // No caching, fresh data every time
    };
  } catch (error) {
    return { notFound: true };
  }
}

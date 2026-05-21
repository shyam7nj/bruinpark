import NavigationBar from './NavigationBar';

function PageLayout({ children, wide = false }) {
  return (
    <>
      <NavigationBar />

      <main className="page">
        <section className={wide ? 'card wide-card' : 'card'}>
          {children}
        </section>
      </main>
    </>
  );
}

export default PageLayout;
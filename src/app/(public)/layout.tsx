export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <a href="/" className="text-sm font-bold tracking-tight">
            ClubOS
          </a>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <a href="/live" className="hover:text-foreground transition-colors">Live</a>
            <a href="/results" className="hover:text-foreground transition-colors">Results</a>
            <a href="/fixtures" className="hover:text-foreground transition-colors">Fixtures</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      <footer className="border-t border-border/50 px-4 py-4 text-center text-xs text-muted-foreground">
        Powered by ClubOS
      </footer>
    </div>
  );
}

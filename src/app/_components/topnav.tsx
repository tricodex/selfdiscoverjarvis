// src/app/_components/topnav.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getServerAuthSession } from "~/server/auth";
import { Button } from '~/components/ui/button';

async function TopNav() {
  const session = await getServerAuthSession();

  return (
    <nav className="topnav-container">
      <div className="topnav-content">
        <Link href="/" className="topnav-logo space-x-0">
          <Image src="/logo.svg" alt="RDJ Logo" width={36} height={40} />
          <span className="topnav-logo-text">RDJ</span>
        </Link>
        <div className="topnav-links">
          <Link href="/" className="topnav-link">Home</Link>
          <Link href="/about" className="topnav-link">About</Link>
          <Link href="/assessment" className="topnav-link">Assessment</Link>
          <Link href="/playground" className="topnav-link">Playground</Link>
          <Link href="/vibes" className="topnav-link">Vibes</Link>
          <Link href="/meditation" className="topnav-link">Meditation</Link>
          <Link href="/present" className="topnav-link">Present</Link>
        </div>
      </div>
      <div className="topnav-auth">
        {session ? (
          <div className="topnav-user-info">
            <span className="topnav-username">Logged in as {session.user?.name}</span>
            <Button asChild variant="outline" className="topnav-button">
              <Link href="/api/auth/signout">Sign out</Link>
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" className="topnav-button">
            <Link href="/api/auth/signin">Sign in</Link>
          </Button>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
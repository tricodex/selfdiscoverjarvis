import Link from 'next/link';
import { getServerAuthSession } from "~/server/auth";

async function TopNav() {
  const session = await getServerAuthSession();

  return (
    <nav className="flex justify-between items-center px-4 py-3 bg-gradient-to-r from-[#2e026d] to-[#15162c] text-white">
      <div>
        <Link href="/" className="mr-4">Home</Link>
        <Link href="/about" className="mr-4">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div>
        {session ? (
          <div className="flex items-center">
            <span className="mr-4">Logged in as {session.user?.name}</span>
            <Link
              href="/api/auth/signout"
              className="rounded-full bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
            >
              Sign out
            </Link>
          </div>
        ) : (
          <Link
            href="/api/auth/signin"
            className="rounded-full bg-white/10 px-4 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}

export default TopNav;
import { Link } from "@tanstack/react-router";
import { Smartphone } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);

  return (
    <footer className="border-t border-border bg-card mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <span className="font-display font-bold text-lg text-primary">
              77mobiles
            </span>
            <span className="text-muted-foreground text-sm">
              — Buy &amp; sell gadgets locally
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-primary transition-colors">
              Browse
            </Link>
            <Link to="/post" className="hover:text-primary transition-colors">
              Post Ad
            </Link>
            <Link
              to="/messages"
              search={{}}
              className="hover:text-primary transition-colors"
            >
              Messages
            </Link>
            <Link
              to="/profile"
              className="hover:text-primary transition-colors"
            >
              Profile
            </Link>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {year} 77mobiles. All rights reserved.</span>
          <span>
            Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

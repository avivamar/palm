export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white/50 py-6 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-sm text-gray-500">
          &copy;
          {' '}
          <span suppressHydrationWarning>
            {new Date().getFullYear()}
          </span>
          {' '}
          Rolitt. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

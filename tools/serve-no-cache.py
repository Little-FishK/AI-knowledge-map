"""Serve the static project locally with caching disabled for browser QA.

Usage (from the repository root):
    python tools/serve-no-cache.py --port 8770

The production artifact remains file:// compatible; this helper only prevents a
long-lived test browser from reusing stale deep-dive scripts between edit batches.
"""

from argparse import ArgumentParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    parser = ArgumentParser()
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8770)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.bind, args.port), NoCacheHandler)
    print(f"Serving without cache on http://{args.bind}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DATA SLAYER - Dashboard Launcher
Menjalankan local web server dan membuka dashboard secara otomatis di browser default.
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def run():
    os.chdir(DIRECTORY)
    # Check port availability or fallback
    port = PORT
    for p in range(PORT, PORT + 20):
        try:
            with socketserver.TCPServer(("", p), Handler) as httpd:
                url = f"http://localhost:{p}/index.html"
                print("=" * 60)
                print("🎯 DATA SLAYER - DASHBOARD ANALISIS KESENJANGAN PENDIDIKAN")
                print("=" * 60)
                print(f"[*] Server aktif di: {url}")
                print("[*] Membuka browser default...")
                print("[*] Tekan Ctrl+C untuk menghentikan server.")
                print("=" * 60)
                webbrowser.open(url)
                httpd.serve_forever()
                break
        except OSError:
            continue

if __name__ == "__main__":
    try:
        run()
    except KeyboardInterrupt:
        print("\n[OK] Server dihentikan. Sampai jumpa!")

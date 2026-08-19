# -*- coding: utf-8 -*-
import json
import os
import re
import html as htmllib
import urllib.request
from pathlib import Path
from html.parser import HTMLParser
from collections import defaultdict

ROOT = Path(r"C:\CiciByte\ÖztürkGüvenlik")
SRC = ROOT / "_source"
ASSETS = ROOT / "assets" / "images"
BASE = "https://xn--ztrkgvenlik-qfb4fd.com"

SECTION_MAP = {
    "kameralar": "services/kameralar",
    "pdsk-sistemleri": "services/pdks-sistemleri",
    "network-sistemleri": "services/network-sistemleri",
    "arac-ici-kamera": "services/arac-ici-kamera",
    "fotokapan": "services/fotokapan",
    "yangin-tupu": "services/yangin-tupu",
    "bariyer-turnike-sistemleri": "services/bariyer-turnike",
    "ses-ve-anons-sistemleri": "services/ses-anons",
    "yangin-alarm-sistemleri": "services/yangin-alarm",
    "akilli-ev-sistemleri": "services/akilli-ev",
    "hirsiz-alarm-sistemleri": "services/hirsiz-alarm",
    "urunlerimiz": "services/hizmetlerimiz",
    "kamera-sistemleri": "services/kamera-sistemleri",
    "althea-wp": "homepage",
}

BRAND_FILES = {
    "sasasa.png": "markalar",
    "seageta.png": "markalar",
    "to-linkk.png": "markalar",
    "unv.png": "markalar",
    "western.png": "markalar",
    "zkt-eco.png": "markalar",
    "tp.png": "markalar",
}

LOGO_KEYS = ("ozturk", "logo")
HERO_KEYS = ("whatsapp-gorsel", "5.jpg", "7.jpg", "10.jpg", "colibri-image")
CEO_KEYS = ("erenyragi",)
STOCK_KEYS = ("pxhere", "colibri-demo", "african-asian", "achievement-agreement")


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip = False
        self.skip_tags = {"script", "style", "noscript"}

    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.skip = True
        if tag in ("p", "br", "li", "h1", "h2", "h3", "h4", "div", "tr"):
            self.parts.append("\n")

    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.skip = False
        if tag in ("p", "li", "h1", "h2", "h3", "h4", "div"):
            self.parts.append("\n")

    def handle_data(self, data):
        if not self.skip:
            self.parts.append(data)


def html_to_text(s: str) -> str:
    p = TextExtractor()
    p.feed(s or "")
    t = "".join(p.parts)
    t = htmllib.unescape(t)
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def safe_name(url: str) -> str:
    name = urllib.request.unquote(url.split("?")[0].rstrip("/").split("/")[-1])
    name = re.sub(r'[<>:"/\\|?*]', "_", name)
    return name or "file.bin"


def classify_image(filename: str, used_on: set) -> str:
    lower = filename.lower()
    if any(k in lower for k in LOGO_KEYS):
        return "branding/logo"
    if filename in BRAND_FILES or any(k.replace(".png", "") in lower for k in BRAND_FILES):
        return "branding/markalar"
    if any(k in lower for k in CEO_KEYS):
        return "homepage/misyon-vizyon"
    if any(k in lower for k in STOCK_KEYS):
        return "homepage/stok-gorseller"
    if "whatsapp-gorsel" in lower or lower in {"5.jpg", "7.jpg", "10.jpg"}:
        return "homepage/hero-slider"
    if lower.startswith("colibri-"):
        return "homepage/tema-gorselleri"
    if "cropped-" in lower:
        return "media/kirpilmis-kopyalar"

    service_hits = [s for s in used_on if s.startswith("services/")]
    if len(service_hits) == 1:
        return service_hits[0]
    if "homepage" in used_on and service_hits:
        return service_hits[0]
    if service_hits:
        return "services/paylasilan"
    if "homepage" in used_on:
        return "homepage/diger"
    return "media/kullanilmamis"


def download(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return True
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            dest.write_bytes(r.read())
        return True
    except Exception as e:
        print("FAIL", url, e)
        return False


def extract_img_urls(html: str) -> set:
    urls = set()
    for m in re.finditer(r"https://xn--ztrkgvenlik-qfb4fd\.com/wp-content/uploads/[^\"'\s)]+", html):
        u = htmllib.unescape(m.group(0)).split(" ")[0]
        u = re.sub(r"-\d+x\d+(?=\.(jpg|jpeg|png|webp|gif))", "", u, flags=re.I)
        urls.add(u)
    for m in re.finditer(r"https://(?:galip\.com\.tr|www\.optimumteknoloji\.com\.tr|m\.media-amazon\.com|res\.cloudinary\.com|www\.bilgesis\.com\.tr|sedguvenlik\.com\.tr)[^\"'\s)]+", html):
        urls.add(htmllib.unescape(m.group(0)).split(" ")[0])
    return urls


def main():
    pages = json.loads((SRC / "pages.json").read_text(encoding="utf-8"))
    media = json.loads((SRC / "media1.json").read_text(encoding="utf-8"))
    posts = json.loads((SRC / "posts.json").read_text(encoding="utf-8"))

    page_html = {}
    usage = defaultdict(set)

    for p in pages:
        slug = p["slug"]
        html = p.get("content", {}).get("rendered", "") or ""
        page_html[slug] = html
        section = SECTION_MAP.get(slug, f"pages/{slug}")
        for u in extract_img_urls(html):
            usage[u].add(section)
            usage[safe_name(u)].add(section)

    home = (SRC / "homepage.html").read_text(encoding="utf-8", errors="replace")
    for u in extract_img_urls(home):
        usage[u].add("homepage")
        usage[safe_name(u)].add("homepage")

    # sitemap extras
    sitemap = (SRC / "page-sitemap.xml").read_text(encoding="utf-8", errors="replace")
    extra_urls = set(re.findall(r"https://[^\]<\s]+", sitemap))
    extra_urls = {u for u in extra_urls if re.search(r"\.(jpg|jpeg|png|webp|gif)$", u, re.I)}

    all_urls = set()
    for m in media:
        url = m.get("source_url")
        if url:
            all_urls.add(url)
    all_urls |= extra_urls
    all_urls |= set(usage.keys())
    all_urls = {u for u in all_urls if u.startswith("http")}

    manifest = []
    for url in sorted(all_urls):
        name = safe_name(url)
        used = usage.get(url, set()) | usage.get(name, set())
        folder = classify_image(name, used)
        dest = ASSETS / folder / name
        ok = download(url, dest)
        rel = dest.relative_to(ROOT).as_posix() if ok else ""
        manifest.append({"url": url, "file": name, "section": folder, "ok": ok, "path": rel, "used_on": sorted(used)})

    (SRC / "image-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("downloaded", sum(1 for x in manifest if x["ok"]), "/", len(manifest))

    # reviews from homepage text
    reviews = []
    # already known from earlier extraction; keep full leftover snippet
    home_text = html_to_text(re.sub(r"<script[\s\S]*?</script>", " ", home, flags=re.I))

    info_pages = []
    for p in pages:
        slug = p["slug"]
        title = htmllib.unescape(p.get("title", {}).get("rendered", ""))
        content = html_to_text(p.get("content", {}).get("rendered", ""))
        excerpt = html_to_text(p.get("excerpt", {}).get("rendered", ""))
        info_pages.append({
            "id": p.get("id"),
            "slug": slug,
            "title": title,
            "link": p.get("link"),
            "modified": p.get("modified"),
            "excerpt": excerpt,
            "content": content,
        })

    (SRC / "pages-clean.json").write_text(json.dumps(info_pages, ensure_ascii=False, indent=2), encoding="utf-8")
    (SRC / "homepage-text.txt").write_text(home_text, encoding="utf-8")
    print("done text extract")


if __name__ == "__main__":
    main()

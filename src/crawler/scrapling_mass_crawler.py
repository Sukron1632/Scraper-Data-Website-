#!/usr/bin/env python3
"""
Scrapling Mass Crawler & Data Extractor
Integrated with Antigravity Guidebook Engine & Dual Gemini Orchestrator
Strict Read-Only & Server-Throttled
"""

import os
import sys
import json
import time
import re
from urllib.parse import urlparse, urljoin
from dotenv import load_dotenv
from scrapling import Fetcher, StealthyFetcher

# Load environment
load_dotenv()

BASE_URL = os.getenv("BASE_URL")
RATE_LIMIT_DELAY = float(os.getenv("RATE_LIMIT_DELAY_MS", "2500")) / 1000.0
MAX_PAGES = int(os.getenv("MAX_PAGES_LIMIT", "60"))
MAX_DEPTH = int(os.getenv("MAX_DEPTH", "3"))
SAFE_MODE = os.getenv("SAFE_MODE", "true").lower() == "true"
ACTIVE_ROLE = os.getenv("ACTIVE_CRAWL_ROLE", "employee")

STORAGE_DIR = os.path.join(os.path.dirname(__file__), "../../storage")
RAW_PAGES_DIR = os.path.join(STORAGE_DIR, "raw_pages")
SCRAPLING_MD_DIR = os.path.join(STORAGE_DIR, "scrapling_markdown")
CHECKPOINT_FILE = os.path.join(STORAGE_DIR, "checkpoints", "scrapling_checkpoint.json")

os.makedirs(RAW_PAGES_DIR, exist_ok=True)
os.makedirs(SCRAPLING_MD_DIR, exist_ok=True)
os.makedirs(os.path.dirname(CHECKPOINT_FILE), exist_ok=True)

# Guardrail forbidden patterns
FORBIDDEN_URL_PATTERNS = [
    "/delete", "/destroy", "/remove", "/edit", "/update", "/save", "/create",
    "action=delete", "action=destroy", "action=update", "action=save"
]

FORBIDDEN_KEYWORDS = [
    "simpan", "save", "submit", "hapus", "delete", "destroy", "remove",
    "ubah", "edit", "update", "bayar", "checkout", "batal", "tambah"
]


# Load Governance Rules for PII & Sensitive Data Masking
GOVERNANCE_PATH = os.path.join(os.path.dirname(__file__), "../../config/data_governance_rules.json")
MASKING_RULES = []
if os.path.exists(GOVERNANCE_PATH):
    try:
        with open(GOVERNANCE_PATH, "r", encoding="utf-8") as gf:
            gov_data = json.load(gf)
            if gov_data.get("sensitiveDataMasking", {}).get("enabled"):
                MASKING_RULES = gov_data["sensitiveDataMasking"].get("rules", [])
    except Exception as ge:
        print(f"[Warning] Failed to load governance rules: {ge}")


def sanitize_sensitive_data(text: str) -> str:
    """Masks PII, NIK, credit cards, bank accounts, and secrets."""
    if not text or not MASKING_RULES:
        return text
    sanitized = text
    for rule in MASKING_RULES:
        try:
            pattern = rule.get("pattern")
            replacement = rule.get("replaceWith", "[DATA_DISAMARKAN]")
            if pattern:
                sanitized = re.sub(pattern, replacement, sanitized)
        except Exception:
            pass
    return sanitized


def is_safe_url(url: str) -> bool:
    """Check if URL violates safe read-only guardrails."""
    lower_url = url.lower()
    for pat in FORBIDDEN_URL_PATTERNS:
        if pat in lower_url:
            return False
    return True


def is_same_host(url1: str, url2: str) -> bool:
    try:
        return urlparse(url1).netloc == urlparse(url2).netloc
    except Exception:
        return False


def clean_url(url: str) -> str:
    parsed = urlparse(url)
    return parsed._replace(fragment="").geturl()


class ScraplingMassCrawler:
    def __init__(self, use_stealth: bool = False):
        self.base_url = BASE_URL
        self.use_stealth = use_stealth
        self.visited = set()
        self.queue = []
        self.crawled_count = 0
        self.load_checkpoint()

    def save_checkpoint(self):
        data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "visited": list(self.visited),
            "queue": self.queue,
            "crawled_count": self.crawled_count
        }
        with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def load_checkpoint(self):
        if os.path.exists(CHECKPOINT_FILE):
            try:
                with open(CHECKPOINT_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.visited = set(data.get("visited", []))
                    self.queue = data.get("queue", [])
                    self.crawled_count = data.get("crawled_count", 0)
                    print(f"[Scrapling] Resumed checkpoint with {len(self.visited)} visited URLs.")
            except Exception as e:
                print(f"[Scrapling] Warning loading checkpoint: {e}")

    def crawl(self):
        print("=" * 65)
        print("   SCRAPLING MASS CRAWLER (ULTRA-FAST & SAFE READ-ONLY)   ")
        print("=" * 65)
        print(f"Base Target URL   : {self.base_url}")
        print(f"Max Pages Limit   : {MAX_PAGES}")
        print(f"Throttling Delay  : {RATE_LIMIT_DELAY}s (Protects Live Server)")
        print(f"Engine Mode       : {'StealthyFetcher' if self.use_stealth else 'Standard Fetcher'}")
        print("=" * 65)

        if not self.base_url:
            print("[Error] BASE_URL is not configured in .env file!")
            sys.exit(1)

        if not self.queue:
            self.queue.append({"url": self.base_url, "depth": 0})

        fetcher = StealthyFetcher if self.use_stealth else Fetcher

        page_index = len(self.visited) + 1

        while self.queue and len(self.visited) < MAX_PAGES:
            item = self.queue.pop(0)
            target_url = clean_url(item["url"])
            depth = item["depth"]

            if target_url in self.visited:
                continue

            if not is_safe_url(target_url):
                print(f"[Guardrail Blocked] Skipping unsafe mutation URL: {target_url}")
                continue

            self.visited.add(target_url)
            print(f"\n[Scrapling] [{page_index}/{MAX_PAGES}] Fetching: {target_url} (Depth: {depth})")

            try:
                # Fetch page via Scrapling
                page = fetcher.get(target_url, timeout=30)

                if page.status in (429, 503):
                    print(f"[Scrapling] Server responded with {page.status}. Backing off for 10s...")
                    time.sleep(10.0)
                    continue

                title = page.css("title::text").get() or "Halaman Operasional"
                title = title.strip()

                # Extract Markdown using native Scrapling markdown converter & sanitize PII
                page_markdown = sanitize_sensitive_data(page.markdown or "")

                # Extract links
                links = []
                for a in page.css("a"):
                    href = a.attrib.get("href", "")
                    text = (a.text or "").strip()
                    if href and not href.startswith("javascript:") and not href.startswith("#"):
                        full_href = urljoin(target_url, href)
                        links.append({"text": text, "href": full_href})

                # Extract table headers
                tables = []
                for tbl in page.css("table"):
                    headers = [sanitize_sensitive_data(th.text.strip()) for th in tbl.css("th") if th.text]
                    tables.append({"headers": headers, "sampleRowCount": len(tbl.css("tr")) - 1})

                # Extract form inputs for employee guidebook explanation
                form_fields = []
                for inp in page.css("input, select, textarea"):
                    name = inp.attrib.get("name", "")
                    inp_type = inp.attrib.get("type", inp.tag)
                    placeholder = inp.attrib.get("placeholder", "")
                    if inp_type not in ("hidden", "submit", "button", "reset"):
                        form_fields.append({
                            "label": sanitize_sensitive_data(placeholder or name or "Kolom Input"),
                            "name": name,
                            "type": inp_type,
                            "placeholder": sanitize_sensitive_data(placeholder)
                        })

                # Safe slug for filename
                safe_slug = re.sub(r"[^a-zA-Z0-9]", "_", target_url)[:60]

                # Save Scrapling Clean Markdown
                md_path = os.path.join(SCRAPLING_MD_DIR, f"{page_index:03d}_{safe_slug}.md")
                with open(md_path, "w", encoding="utf-8") as f:
                    f.write(f"# {title}\nURL: {target_url}\n\n{page_markdown}")

                # Save Raw JSON metadata compatible with Dual Gemini Orchestrator
                page_data = {
                    "pageIndex": page_index,
                    "pageTitle": title,
                    "currentUrl": target_url,
                    "headings": [{"tag": "h1", "text": title}],
                    "breadcrumbs": [],
                    "navigationLinks": links[:25],
                    "formFields": form_fields[:25],
                    "tables": tables[:5],
                    "actionButtons": [],
                    "role": ACTIVE_ROLE,
                    "markdownFile": os.path.basename(md_path),
                    "crawledWith": "scrapling"
                }

                json_path = os.path.join(RAW_PAGES_DIR, f"{page_index:03d}_{safe_slug}.json")
                with open(json_path, "w", encoding="utf-8") as f:
                    json.dump(page_data, f, indent=2, ensure_ascii=False)

                print(f"[Scrapling] Captured: \"{title}\" | Links: {len(links)} | Fields: {len(form_fields)} | Markdown: {len(page_markdown)} chars")

                # Enqueue safe child links
                if depth < MAX_DEPTH:
                    for link in links:
                        c_href = clean_url(link["href"])
                        if is_same_host(self.base_url, c_href) and c_href not in self.visited and is_safe_url(c_href):
                            # Verify text not destructive
                            l_text = link["text"].lower()
                            if not any(k in l_text for k in FORBIDDEN_KEYWORDS):
                                self.queue.append({"url": c_href, "depth": depth + 1})

                page_index += 1
                self.save_checkpoint()

                # Sleep rate limit to protect live server
                print(f"[Scrapling] Sleeping {RATE_LIMIT_DELAY}s to protect live server load...")
                time.sleep(RATE_LIMIT_DELAY)

            except Exception as e:
                print(f"[Scrapling Error] {target_url}: {e}")
                time.sleep(RATE_LIMIT_DELAY)

        print("\n" + "=" * 65)
        print("   SCRAPLING MASS CRAWL FINISHED SUCCESSFULLY   ")
        print(f"Total Pages Processed: {page_index - 1}")
        print(f"Markdown Content In : {SCRAPLING_MD_DIR}")
        print(f"Raw Schemas In      : {RAW_PAGES_DIR}")
        print("=" * 65)


if __name__ == "__main__":
    use_stealth_mode = "--stealth" in sys.argv
    crawler = ScraplingMassCrawler(use_stealth=use_stealth_mode)
    crawler.crawl()


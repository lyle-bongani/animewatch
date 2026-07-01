from playwright.sync_api import sync_playwright
import json

def run():
    print("Launching playwright...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        url = "https://donghuastream.org/anime/soul-land/"
        print(f"Navigating to {url}...")
        page.goto(url, wait_until="load", timeout=30000)
        
        print("Extracting episode links...")
        links = page.evaluate("""
            () => {
                const results = [];
                document.querySelectorAll('a').forEach(a => {
                    const title = a.textContent.trim();
                    const href = a.href;
                    if (href && href.includes('-episode-')) {
                        results.push({ 'title': title, 'href': href });
                    }
                });
                return results;
            }
        """)
        
        print("Found Episode Links (first 10):")
        print(json.dumps(links[:10], indent=2))
        
        browser.close()

if __name__ == "__main__":
    run()

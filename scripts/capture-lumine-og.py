import asyncio
from playwright.async_api import async_playwright

OUT = r"E:\Software development\syntance-web\public\portfolio\lumine-concept-preview.png"


async def main() -> None:
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1200, "height": 630})
        await page.goto("https://lumineconcept.pl", wait_until="networkidle")

        for label in ("Akceptuj wszystko", "Tylko niezbędne", "Odrzuć"):
            button = page.get_by_role("button", name=label)
            if await button.count():
                await button.first.click()
                await page.wait_for_timeout(400)
                break

        await page.wait_for_timeout(800)
        await page.screenshot(path=OUT, type="png")
        await browser.close()
        print(f"saved {OUT}")


asyncio.run(main())

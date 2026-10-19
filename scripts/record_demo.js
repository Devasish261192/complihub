const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log("--------------------------------------------------");
  console.log("Starting GRC Portal Walkthrough Recorder...");
  console.log("--------------------------------------------------");

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Create dummy receipt file for the upload form step
  const mockReceiptPath = path.join(outputDir, 'mock_receipt.pdf');
  fs.writeFileSync(mockReceiptPath, 'Statutory GRC Filing Receipt Proof (Sample)');

  // Launch browser in non-headless mode so it renders and records
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000 // Slow down operations to look natural
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();

  try {
    // 1. Navigate and Login
    console.log("[1/6] Opening login page...");
    await page.goto('http://localhost:3000/login');
    await page.waitForTimeout(2000);

    console.log("Typing login credentials for admin@abc.com...");
    await page.fill('input[type="email"]', 'admin@abc.com');
    await page.fill('input[type="password"]', 'test123');
    await page.waitForTimeout(1000);

    console.log("Submitting login form...");
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.waitForTimeout(3000);

    // 2. Dashboard Review
    console.log("[2/6] Reviewing GRC Dashboard...");
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollBy({ top: -300, behavior: 'smooth' }));
    await page.waitForTimeout(2500);

    // 3. Calendar Navigation
    console.log("[3/6] Navigating to Compliance Calendar...");
    await page.click('text=Calendar');
    await page.waitForTimeout(3000);

    console.log("Selecting statutory day on calendar grid...");
    // Let's click day 15 cell
    await page.click('button:has-text("15")');
    await page.waitForTimeout(2000);

    console.log("Toggling GST filter checkbox...");
    await page.click('text=GST');
    await page.waitForTimeout(2000);
    await page.click('text=GST'); // toggle back
    await page.waitForTimeout(2000);

    // 4. Obligations Tasks Register
    console.log("[4/6] Navigating to Obligations Register (Tasks)...");
    await page.click('text=Tasks');
    await page.waitForTimeout(3000);

    console.log("Filtering tasks by 'Overdue' status...");
    await page.click('text=Overdue');
    await page.waitForTimeout(2000);

    console.log("Filtering tasks by 'Active Pending'...");
    await page.click('text=Active Pending');
    await page.waitForTimeout(2000);

    console.log("Filtering tasks by 'All'...");
    await page.click('text=All (');
    await page.waitForTimeout(2000);

    console.log("Typing search query 'GST'...");
    await page.fill('input[placeholder*="Search by"]', 'GST');
    await page.waitForTimeout(2000);
    await page.fill('input[placeholder*="Search by"]', '');
    await page.waitForTimeout(1000);

    // 5. Reports Timeline
    console.log("[5/6] Navigating to GRC Compliance Reports...");
    await page.click('text=Reports');
    await page.waitForTimeout(3000);

    console.log("Inspecting monthly outcome histogram...");
    const bars = await page.$$('.group.cursor-pointer');
    if (bars.length > 0) {
      // Hover over middle bar
      const midIdx = Math.floor(bars.length / 2);
      await bars[midIdx].hover();
      await page.waitForTimeout(2000);

      // Hover over latest month bar
      await bars[bars.length - 1].hover();
      await page.waitForTimeout(2000);
    }

    console.log("Scrolling reports statistics...");
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(3000);
    await page.evaluate(() => window.scrollBy({ top: -350, behavior: 'smooth' }));
    await page.waitForTimeout(1500);

    // 6. Settings Page & File Return Wizard
    console.log("[6/6] Navigating to Settings...");
    await page.click('text=Settings');
    await page.waitForTimeout(2000);

    console.log("Opening File Return Wizard...");
    await page.click('text=File New Return');
    await page.waitForTimeout(2000);

    console.log("Selecting pending obligation from dropdown...");
    const select = await page.$('select#taskId');
    if (select) {
      const options = await page.$$eval('select#taskId option', opts => opts.map(o => o.value));
      const firstTaskOption = options.find(val => val !== "");
      
      if (firstTaskOption) {
        await page.selectOption('select#taskId', firstTaskOption);
        await page.waitForTimeout(1500);

        console.log("Typing receipt number...");
        await page.fill('input#challanNumber', 'TRRN-992019483011');
        await page.waitForTimeout(1000);

        console.log("Uploading filing proof copy...");
        await page.setInputFiles('input#receiptFile', mockReceiptPath);
        await page.waitForTimeout(1000);

        console.log("Typing submission remarks...");
        await page.fill('textarea#remarks', 'Filing successfully completed and verified in client demonstration walkthrough.');
        await page.waitForTimeout(1500);

        console.log("Submitting return...");
        await page.click('button[type="submit"]');
        await page.waitForURL('**/tasks?success=*');
        await page.waitForTimeout(3500);
      } else {
        console.log("No pending tasks found. Skipping submission form...");
      }
    }

    console.log("Closing browser and finalizing video...");
  } catch (err) {
    console.error("Error during walkthrough automation:", err);
  } finally {
    await context.close();
    await browser.close();
  }

  // Clean up dummy receipt file
  if (fs.existsSync(mockReceiptPath)) {
    fs.unlinkSync(mockReceiptPath);
  }

  console.log("--------------------------------------------------");
  console.log("Walkthrough recording completed successfully!");
  console.log(`Video saved in recordings directory: ${outputDir}`);
  console.log("--------------------------------------------------");
})();

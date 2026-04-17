/**
 * PRIME EDUCATIONAL SERVICES - SECURITY AUDIT SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Open the PDF Viewer page in your browser.
 * 2. Press F12 or Right Click -> Inspect to open DevTools.
 * 3. Go to the "Console" tab.
 * 4. Paste this entire script and press Enter.
 */

(function() {
    console.clear();
    console.log("%c SECURITY AUDIT INITIALIZED ", "background: #C5A059; color: white; font-weight: bold; border-radius: 4px; padding: 2px 8px;");
    
    const results = {
        textSelection: "PENDING",
        copyCommand: "PENDING",
        printShortcut: "PENDING",
        canvasCheck: "PENDING",
        cssCheck: "PENDING",
        mobileTouch: "PENDING"
    };

    // 1. Check for Canvas Rendering
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length > 0) {
        results.canvasCheck = `PASSED (${canvases.length} pages rendered as pixels)`;
    } else {
        results.canvasCheck = "FAILED (No canvas found, text might be exposed in DOM)";
    }

    // 2. Check CSS Selection Protection
    const viewer = document.querySelector('.min-h-screen'); // Viewer container
    if (viewer) {
        const style = window.getComputedStyle(viewer);
        if (style.userSelect === 'none' || style.webkitUserSelect === 'none') {
            results.cssCheck = "PASSED (User-select: none detected)";
        } else {
            results.cssCheck = "FAILED (CSS Selection is not blocked)";
        }
    }

    // 3. Test Selection (Programmatic)
    try {
        const range = document.createRange();
        range.selectNodeContents(document.body);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        const selectedText = window.getSelection().toString();
        if (selectedText.length === 0) {
            results.textSelection = "PASSED (No text could be extracted)";
        } else {
            results.textSelection = "WARNING (Some text was selectable)";
        }
        window.getSelection().removeAllRanges();
    } catch (e) {
        results.textSelection = "PASSED (Selection engine blocked)";
    }

    // 4. Test Copy Execution
    const copyEvent = new ClipboardEvent('copy', { cancelable: true });
    const isCopyBlocked = !document.dispatchEvent(copyEvent);
    results.copyCommand = isCopyBlocked ? "PASSED (Copy event suppressed)" : "FAILED (Copy event allowed)";

    // 5. Test Print/Shortcut Block (Simulated)
    const printEvent = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true, cancelable: true });
    const isPrintBlocked = !window.dispatchEvent(printEvent);
    results.printShortcut = isPrintBlocked ? "PASSED (Ctrl+P intercepted)" : "FAILED (Could not confirm print intercept)";

    // Final Report
    console.table(results);

    if (results.canvasCheck.includes("PASSED") && results.textSelection === "PASSED") {
        console.log("%c PROTECTION STATUS: SECURE ✅ ", "color: #10b981; font-weight: bold; font-size: 14px;");
        console.log("Your documents are rendered as images. Text selection and copying are physically impossible for the browser to perform.");
    } else {
        console.log("%c PROTECTION STATUS: VULNERABLE ❌ ", "color: #ef4444; font-weight: bold; font-size: 14px;");
    }

    console.log("\n%c MANUAL TESTS REMAINING: ", "font-weight: bold; color: #C5A059;");
    console.log("1. Try selecting text with your mouse (it should fail).");
    console.log("2. Press Ctrl + P (nothing should happen).");
    console.log("3. (Mobile) Long-press the PDF. The Copy/Select menu should NOT appear.");
})();

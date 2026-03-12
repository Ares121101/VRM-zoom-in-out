/* * ==========================================
 * VRM Quick Zoom In/Out
 * Created by Stoyan Georgiev
 * ==========================================
 */

let navigationStack = []; 
let pendingZoomData = null; // Stores data ONLY while hovering

// --- 1. TRACK THE TOOLTIP (The "Source of Truth") ---
document.addEventListener('mouseover', function(e) {
    const tooltipTitle = document.querySelector('.highcharts-tooltip__title');
    if (tooltipTitle) {
        const rawText = tooltipTitle.textContent.trim();
        const parts = rawText.match(/(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})\s-\s(\d{4}-\d{2}-\d{2})\s(\d{2}:\d{2})/);
        if (parts) {
            pendingZoomData = {
                startD: parts[1], startT: parts[2],
                endD:   parts[3], endT:   parts[4]
            };
        }
    } else {
        pendingZoomData = null; // Clear it if we aren't hovering a bar
    }
});

// --- 2. ZOOM IN (Left Click) ---
document.addEventListener('click', function(e) {
    // ONLY zoom if we have active data AND we are clicking inside the chart
    if (pendingZoomData && e.target.closest('.highcharts-container')) {
        const fromD = document.getElementById('dpMin');
        const toD = document.getElementById('dpMax');
        const times = document.querySelectorAll('.vrm-date-time-picker__dropdown__custom-time');

        if (fromD && toD && times.length >= 2) {
            // Save history
            const currentView = {
                startD: fromD.value, startT: times[0].value,
                endD:   toD.value,   endT:   times[1].value
            };

            const lastView = navigationStack[navigationStack.length - 1];
            if (!lastView || lastView.startD !== currentView.startD) {
                navigationStack.push(currentView);
            }

            console.log("Zooming In...");
            simulateHumanChange(fromD, pendingZoomData.startD);
            simulateHumanChange(times[0], pendingZoomData.startT);
            
            setTimeout(() => {
                simulateHumanChange(toD, pendingZoomData.endD);
                simulateHumanChange(times[1], pendingZoomData.endT);
            }, 50);
        }
    }
}, true);

// --- 3. ZOOM OUT (Right Click - Boundary Limited) ---
document.addEventListener('contextmenu', function(e) {
    // Only intercept if the click is INSIDE the chart container
    if (e.target.closest('.highcharts-container')) {
        e.preventDefault(); 

        if (navigationStack.length > 0) {
            const fromD = document.getElementById('dpMin');
            const toD = document.getElementById('dpMax');
            const times = document.querySelectorAll('.vrm-date-time-picker__dropdown__custom-time');

            const previousView = navigationStack.pop(); 
            console.log("Zooming Out...");

            simulateHumanChange(fromD, previousView.startD);
            simulateHumanChange(times[0], previousView.startT);
            
            setTimeout(() => {
                simulateHumanChange(toD, previousView.endD);
                simulateHumanChange(times[1], previousView.endT);
            }, 50);
        }
    }
}, true);

function simulateHumanChange(el, val) {
    if (!el) return;
    el.focus();
    el.value = val;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));
}
<script>
(function() {
    'use strict';
    
    // Only run if we're in an iframe
    if (window.self === window.top) {
        return;
    }

    // Function to disable scrolling
    function disableScrolling() {
        if (document.body) {
            document.body.classList.add('in-iframe');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        }
    }

    // Disable scrolling immediately if body exists, otherwise wait for DOM
    if (document.body) {
        disableScrolling();
    } else {
        document.addEventListener('DOMContentLoaded', disableScrolling);
    }

    let lastSentHeight = 0;
    let stableHeight = 0;
    let stableHeightTimer = null;
    let pendingHeight = null;
    let lastUpdateTime = 0;
    let resizeObserver = null;
    let currentBreakpoint = null;
    
    const COOLDOWN_MS = 300;
    const STABLE_DELAY_MS = 400;
    const MAX_HEIGHT = 100000;
    const MIN_HEIGHT = 100;
    const MIN_CHANGE_PX = 5;

    // Handle breakpoint change from parent window
    function handleBreakpointChange(newBreakpoint) {
        if (currentBreakpoint !== null && currentBreakpoint !== newBreakpoint) {
            // Breakpoint changed - reset everything and force update
            currentBreakpoint = newBreakpoint;
            lastSentHeight = 0; // Reset to force update
            stableHeight = 0;
            pendingHeight = null;
            clearTimeout(stableHeightTimer);
            // Force immediate height update after breakpoint change
            setTimeout(forceSendHeight, 150);
            return true;
        }
        if (currentBreakpoint === null) {
            currentBreakpoint = newBreakpoint;
        }
        return false;
    }

    // Listen for breakpoint change messages from parent
    window.addEventListener('message', function(event) {
        // Accept messages from any origin (parent window)
        if (event.data && event.data.type === 'breakpointChange') {
            handleBreakpointChange(event.data.breakpoint);
        }
    });

    // Calculate height based on actual content
    function getDocumentHeight() {
        const body = document.body;
        const html = document.documentElement;
        
        if (!body || !html) {
            return 0;
        }

        // Get all possible height measurements
        const measurements = [
            body.scrollHeight,
            body.offsetHeight,
            html.scrollHeight,
            html.offsetHeight,
            Math.max(body.scrollHeight, html.scrollHeight)
        ].filter(h => h > 0);

        if (measurements.length === 0) {
            return 0;
        }

        // Use the maximum, but cap it
        const height = Math.max(...measurements);
        
        return Math.max(MIN_HEIGHT, Math.min(height, MAX_HEIGHT));
    }

    // Check if height is stable (hasn't changed recently)
    function checkStableHeight() {
        const currentHeight = getDocumentHeight();
        
        // If height changed, reset the timer
        if (Math.abs(currentHeight - pendingHeight) > MIN_CHANGE_PX || pendingHeight === null) {
            pendingHeight = currentHeight;
            clearTimeout(stableHeightTimer);
            stableHeightTimer = setTimeout(function() {
                // Height has been stable, now we can send it
                if (Math.abs(pendingHeight - stableHeight) > MIN_CHANGE_PX || stableHeight === 0) {
                    sendHeight(pendingHeight);
                    stableHeight = pendingHeight;
                }
            }, STABLE_DELAY_MS);
        }
    }

    // Send height to parent
    function sendHeight(height, force) {
        const now = Date.now();
        
        // Cooldown check (skip if forced)
        if (!force && now - lastUpdateTime < COOLDOWN_MS) {
            return;
        }

        // Validate height
        if (height < MIN_HEIGHT || height > MAX_HEIGHT) {
            return;
        }

        // Check if change is significant (skip check if forced)
        if (!force) {
            const heightDiff = Math.abs(height - lastSentHeight);
            if (heightDiff < MIN_CHANGE_PX && lastSentHeight > 0) {
                return; // Not significant enough
            }
        }

        lastSentHeight = height;
        lastUpdateTime = now;

        // Send message to parent window
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'iframeHeight',
                height: height
            }, '*');
        }
    }

    // Force send height (for initial load, navigation, breakpoint changes)
    function forceSendHeight() {
        const height = getDocumentHeight();
        if (height >= MIN_HEIGHT) {
            sendHeight(height, true); // Force send
            stableHeight = height;
            pendingHeight = height;
        }
    }

    // Debounced height check
    let debounceTimer = null;
    function debouncedHeightCheck(force) {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        const delay = force ? 50 : 100;
        debounceTimer = setTimeout(function() {
            if (force) {
                forceSendHeight();
            } else {
                checkStableHeight();
            }
        }, delay);
    }

    // Send initial height after page load
    function sendInitialHeight() {
        if (document.readyState === 'complete') {
            setTimeout(forceSendHeight, 300);
        } else {
            window.addEventListener('load', function() {
                setTimeout(forceSendHeight, 500);
            });
        }
    }

    // Use ResizeObserver to watch for content size changes
    if (window.ResizeObserver && document.body) {
        resizeObserver = new ResizeObserver(function(entries) {
            // Check if body size actually changed
            for (let entry of entries) {
                const newHeight = entry.contentRect.height;
                if (Math.abs(newHeight - pendingHeight) > MIN_CHANGE_PX || pendingHeight === null) {
                    debouncedHeightCheck();
                }
            }
        });
        
        resizeObserver.observe(document.body);
        
        // Also observe html element
        if (document.documentElement) {
            resizeObserver.observe(document.documentElement);
        }
    }

    // Window resize handler - for content changes (breakpoint changes handled by parent)
    let windowResizeTimer = null;
    window.addEventListener('resize', function() {
        clearTimeout(windowResizeTimer);
        // Wait for layout to stabilize after resize
        windowResizeTimer = setTimeout(function() {
            debouncedHeightCheck();
        }, 500);
    });

    // Listen to NodeBB's ajaxify events for navigation
    if (window.app && window.app.ajaxify) {
        if (window.$(document)) {
            window.$(document).on('action:ajaxify.contentLoaded', function() {
                setTimeout(forceSendHeight, 400);
            });

            window.$(document).on('action:ajaxify.end', function() {
                setTimeout(forceSendHeight, 600);
            });
        }
    }

    // Use hooks if available (NodeBB's hook system)
    if (window.hooks && window.hooks.on) {
        window.hooks.on('action:ajaxify.contentLoaded', function() {
            setTimeout(forceSendHeight, 400);
        });

        window.hooks.on('action:ajaxify.end', function() {
            setTimeout(forceSendHeight, 600);
        });
    }

    // Monitor for images loading
    let imageLoadTimer = null;
    document.addEventListener('load', function(e) {
        if (e.target.tagName === 'IMG') {
            clearTimeout(imageLoadTimer);
            imageLoadTimer = setTimeout(function() {
                debouncedHeightCheck();
            }, 300);
        }
    }, true);

    // Monitor for AJAX content loading
    if (window.jQuery) {
        window.jQuery(document).ajaxComplete(function() {
            setTimeout(function() {
                debouncedHeightCheck();
            }, 300);
        });
    }

    // Send initial height
    sendInitialHeight();
})();
</script>

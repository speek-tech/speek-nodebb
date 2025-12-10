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
    let paginationInProgress = false;
    let paginationTimeouts = [];
    let paginationVerificationTimer = null;
    
    const COOLDOWN_MS = 300;
    const STABLE_DELAY_MS = 400;
    const MAX_HEIGHT = 100000;
    const MIN_HEIGHT = 100;
    const MIN_CHANGE_PX = 5;
    const PAGINATION_VERIFICATION_DELAY_MS = 1500;

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

    // Calculate height based on actual visible content
    function getDocumentHeight() {
        const body = document.body;
        const html = document.documentElement;
        
        if (!body || !html) {
            return 0;
        }

        // Helper to check if element is visible
        function isElementVisible(element) {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0' &&
                   element.offsetHeight > 0;
        }

        // Get the main content container (topic posts area)
        var topicPosts = document.querySelector('[component="topic/posts"]');
        if (!topicPosts) {
            var firstPost = document.querySelector('[component="post"]');
            topicPosts = firstPost ? firstPost.parentElement : null;
        }
        if (!topicPosts) {
            topicPosts = body;
        }
        
        // Calculate height from visible content
        let contentHeight = 0;
        
        // Method 1: Use getBoundingClientRect for more accurate measurement
        if (topicPosts && topicPosts !== body) {
            const rect = topicPosts.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            contentHeight = rect.bottom + scrollTop;
        }
        
        // Method 2: Get height from last visible element
        const allElements = document.querySelectorAll('body > *');
        let lastVisibleBottom = 0;
        for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i];
            if (isElementVisible(el)) {
                const rect = el.getBoundingClientRect();
                const bottom = rect.bottom + (window.pageYOffset || document.documentElement.scrollTop);
                if (bottom > lastVisibleBottom) {
                    lastVisibleBottom = bottom;
                }
            }
        }
        
        // Method 3: Traditional scrollHeight measurements (fallback)
        const measurements = [
            body.scrollHeight,
            html.scrollHeight,
            contentHeight,
            lastVisibleBottom
        ].filter(h => h > 0 && h < MAX_HEIGHT);

        if (measurements.length === 0) {
            return 0;
        }

        // Use the maximum of valid measurements, but prefer content-based measurements
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

    // ResizeObserver - throttled but responsive
    var resizeObserverTimer = null;
    if (window.ResizeObserver && document.body) {
        resizeObserver = new ResizeObserver(function(entries) {
            // Throttle with debounce
            if (resizeObserverTimer) clearTimeout(resizeObserverTimer);
            resizeObserverTimer = setTimeout(function() {
                var height = getDocumentHeight();
                // Only update if significant change (>50px)
                if (Math.abs(height - lastSentHeight) > 50) {
                    forceSendHeight();
                }
            }, 300);
        });
        
        resizeObserver.observe(document.body);
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

    // Clear all pagination-related timeouts
    function clearPaginationTimeouts() {
        paginationTimeouts.forEach(function(timeoutId) {
            clearTimeout(timeoutId);
        });
        paginationTimeouts = [];
        if (paginationVerificationTimer) {
            clearTimeout(paginationVerificationTimer);
            paginationVerificationTimer = null;
        }
    }

    // Handle pagination completion with verification
    function handlePaginationComplete() {
        paginationInProgress = false;
        clearPaginationTimeouts();
        
        // Initial height update after pagination
        debouncedForceSendHeight(400);
        
        // Final verification after content fully stabilizes
        paginationVerificationTimer = setTimeout(function() {
            forceSendHeight();
            // One more check to catch any late-loading content
            setTimeout(function() {
                const currentHeight = getDocumentHeight();
                const lastHeight = lastSentHeight;
                // Only update if there's a significant difference (content might have loaded)
                if (Math.abs(currentHeight - lastHeight) > MIN_CHANGE_PX) {
                    forceSendHeight();
                }
            }, 300);
        }, PAGINATION_VERIFICATION_DELAY_MS);
    }

    // Listen to NodeBB's ajaxify events for navigation
    if (window.app && window.app.ajaxify) {
        if (window.$(document)) {
            window.$(document).on('action:ajaxify.contentLoaded', function() {
                if (paginationInProgress) {
                    // Clear any pending pagination timeouts
                    clearPaginationTimeouts();
                }
                debouncedForceSendHeight(400);
            });

            window.$(document).on('action:ajaxify.end', function() {
                if (paginationInProgress) {
                    // Pagination completed - use specialized handler
                    handlePaginationComplete();
                } else {
                    debouncedForceSendHeight(600);
                }
            });
        }
    }

    // Height update for post events - single delayed call to avoid scroll issues
    var heightUpdateTimer = null;
    function debouncedForceSendHeight(delay) {
        clearTimeout(heightUpdateTimer);
        heightUpdateTimer = setTimeout(function() {
            forceSendHeight();
            // Do a second update after more time to catch any layout settling
            setTimeout(forceSendHeight, 300);
        }, delay || 400);
    }

    // Function to register hooks when available
    function registerHooks() {
        if (window.hooks && window.hooks.on) {
            window.hooks.on('action:ajaxify.contentLoaded', function() {
                if (paginationInProgress) {
                    clearPaginationTimeouts();
                }
                debouncedForceSendHeight(400);
            });

            window.hooks.on('action:ajaxify.end', function() {
                if (paginationInProgress) {
                    handlePaginationComplete();
                } else {
                    debouncedForceSendHeight(600);
                }
            });

            // Listen for new posts being added (replies, real-time updates)
            window.hooks.on('action:posts.loaded', function() {
                debouncedForceSendHeight(500);
            });

            // Listen for quickreply success
            window.hooks.on('action:quickreply.success', function() {
                debouncedForceSendHeight(500);
            });
            
            return true;
        }
        return false;
    }

    // Try to register hooks immediately, or wait for them to be available
    if (!registerHooks()) {
        // Poll for hooks to become available (NodeBB initializes them later)
        var hookCheckInterval = setInterval(function() {
            if (registerHooks()) {
                clearInterval(hookCheckInterval);
            }
        }, 100);
        
        // Stop checking after 10 seconds
        setTimeout(function() {
            clearInterval(hookCheckInterval);
        }, 10000);
    }

    // jQuery-based fallback for post events (more reliable timing)
    function setupJQueryListeners() {
        if (window.jQuery || window.$) {
            var $ = window.jQuery || window.$;
            $(document).on('action:posts.loaded', function() {
                debouncedForceSendHeight(500);
            });
            $(document).on('action:quickreply.success', function() {
                debouncedForceSendHeight(500);
            });
            $(window).on('action:posts.loaded', function() {
                debouncedForceSendHeight(500);
            });
            $(window).on('action:quickreply.success', function() {
                debouncedForceSendHeight(500);
            });
            return true;
        }
        return false;
    }

    // Try jQuery listeners immediately or wait
    if (!setupJQueryListeners()) {
        var jqCheckInterval = setInterval(function() {
            if (setupJQueryListeners()) {
                clearInterval(jqCheckInterval);
            }
        }, 100);
        setTimeout(function() {
            clearInterval(jqCheckInterval);
        }, 10000);
    }

    // MutationObserver disabled - was causing input lag
    // Relying on event-based detection (hooks + jQuery) instead

    // Pagination click listener - event-driven approach
    document.addEventListener('click', function(e) {
        var target = e.target;
        
        // Check if clicked element or its parent is a pagination link
        while (target && target !== document) {
            if (target.classList && (
                target.classList.contains('page-link') || 
                target.closest('.pagination') ||
                target.closest('[component="pagination"]')
            )) {
                // Mark pagination as in progress
                paginationInProgress = true;
                
                // Clear any existing pagination timeouts
                clearPaginationTimeouts();
                
                // Reset height tracking to allow fresh calculation
                lastSentHeight = 0;
                stableHeight = 0;
                pendingHeight = null;
                
                // Let ajaxify events handle the actual height updates
                // The ajaxify.end event will trigger handlePaginationComplete()
                break;
            }
            target = target.parentElement;
        }
    });

    // Monitor for images loading (throttled)
    var imageLoadTimer = null;
    var lastImageLoad = 0;
    document.addEventListener('load', function(e) {
        if (e.target.tagName === 'IMG') {
            var now = Date.now();
            if (now - lastImageLoad < 1000) return; // Max once per second
            lastImageLoad = now;
            
            clearTimeout(imageLoadTimer);
            imageLoadTimer = setTimeout(forceSendHeight, 500);
        }
    }, true);

    // Send initial height
    sendInitialHeight();
})();
</script>
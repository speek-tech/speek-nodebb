<script>
(function() {
    'use strict';
    
    // Only run if we're in an iframe
    if (window.self === window.top) {
        return;
    }

    // Configuration
    const CONFIG = {
        minHeight: 100,
        maxHeight: 100000,
        minChange: 5,
        debounceDelay: 150,
        stableDelay: 300
    };
    
    // State
    let parentOrigin = null;
    let lastSentHeight = 0;
    let debounceTimer = null;
    let stableTimer = null;
    let observers = [];
    let currentBreakpoint = null;
    
    // Disable iframe scrolling
    function disableScrolling() {
        if (document.body) {
            document.body.classList.add('in-iframe');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        }
    }
    
    // Calculate document height
    function getHeight() {
        if (!document.body || !document.documentElement) return 0;
        
        const height = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        return Math.max(CONFIG.minHeight, Math.min(height, CONFIG.maxHeight));
    }
    
    // Send height to parent
    function sendHeight(force = false) {
        if (!parentOrigin) {
            console.warn('[iframe-height-notifier] Parent origin not set yet, skipping height update');
            return;
        }
        
        const height = getHeight();
        
        // Check if change is significant
        if (!force && Math.abs(height - lastSentHeight) < CONFIG.minChange) {
            console.log('[iframe-height-notifier] Height change too small, skipping:', height, 'vs', lastSentHeight);
            return;
        }
        
        lastSentHeight = height;
        console.log('[iframe-height-notifier] Sending height to parent:', height, 'force:', force);
        
        try {
            window.parent.postMessage({
                type: 'iframeHeight',
                height: height,
                timestamp: Date.now()
            }, parentOrigin);
        } catch (error) {
            console.error('[iframe-height-notifier] Failed to send height:', error);
        }
    }
    
    // Debounced height update
    function updateHeight(force = false) {
        clearTimeout(debounceTimer);
        clearTimeout(stableTimer);
        
        if (force) {
            debounceTimer = setTimeout(() => sendHeight(true), 50);
        } else {
            // Wait for stable height
            debounceTimer = setTimeout(() => {
                const currentHeight = getHeight();
                stableTimer = setTimeout(() => {
                    if (Math.abs(getHeight() - currentHeight) < CONFIG.minChange) {
                        sendHeight();
                    }
                }, CONFIG.stableDelay);
            }, CONFIG.debounceDelay);
        }
    }
    
    // Handle messages from parent
    function handleParentMessage(event) {
        const data = event.data;
        
        // Initialize parent origin from handshake
        if (data?.type === 'parentOrigin' && data?.origin) {
            if (!parentOrigin) {
                parentOrigin = data.origin;
                console.log('[iframe-height-notifier] Parent origin set to:', parentOrigin);
                // Send initial height now that we have parent origin
                setTimeout(() => updateHeight(true), 100);
            }
            return;
        }
        
        // Only accept messages from known parent origin
        if (!parentOrigin || event.origin !== parentOrigin) {
            return;
        }
        
        // Handle breakpoint changes
        if (data?.type === 'breakpointChange') {
            if (currentBreakpoint !== null && currentBreakpoint !== data.breakpoint) {
                // Breakpoint changed - force height update
                currentBreakpoint = data.breakpoint;
                lastSentHeight = 0; // Reset to force update
                setTimeout(() => updateHeight(true), 150);
            } else if (currentBreakpoint === null) {
                currentBreakpoint = data.breakpoint;
            }
            return;
        }
        
        // Handle force height update requests
        if (data?.type === 'forceHeightUpdate') {
            lastSentHeight = 0; // Reset to force update
            updateHeight(true);
            return;
        }
    }
    
    // Initialize observers
    function initObservers() {
        // 1. ResizeObserver for content size changes
        if (window.ResizeObserver && document.body) {
            const resizeObserver = new ResizeObserver((entries) => {
                console.log('[iframe-height-notifier] ResizeObserver triggered');
                updateHeight();
            });
            resizeObserver.observe(document.body);
            if (document.documentElement) {
                resizeObserver.observe(document.documentElement);
            }
            observers.push(resizeObserver);
            console.log('[iframe-height-notifier] ResizeObserver initialized');
        }
        
        // 2. MutationObserver for DOM changes (throttled)
        if (window.MutationObserver && document.body) {
            let mutationTimer = null;
            const mutationObserver = new MutationObserver((mutations) => {
                console.log('[iframe-height-notifier] MutationObserver triggered, mutations:', mutations.length);
                clearTimeout(mutationTimer);
                mutationTimer = setTimeout(() => updateHeight(true), 200);
            });
            
            mutationObserver.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['style', 'class']
            });
            observers.push(mutationObserver);
            console.log('[iframe-height-notifier] MutationObserver initialized');
        }
    }
    
    // Setup NodeBB hooks
    function setupNodeBBHooks() {
        const events = [
            'action:ajaxify.contentLoaded',
            'action:ajaxify.end',
            'action:posts.loaded',
            'action:quickreply.success'
        ];
        
        if (window.hooks?.on) {
            console.log('[iframe-height-notifier] Setting up NodeBB hooks');
            events.forEach(event => {
                window.hooks.on(event, () => {
                    console.log('[iframe-height-notifier] Hook fired:', event);
                    updateHeight(true);
                });
            });
            return true;
        }
        return false;
    }
    
    // Setup jQuery listeners as fallback
    function setupJQueryListeners() {
        if (window.jQuery || window.$) {
            const $ = window.jQuery || window.$;
            console.log('[iframe-height-notifier] Setting up jQuery listeners');
            
            $(document).on('action:ajaxify.contentLoaded', () => {
                console.log('[iframe-height-notifier] jQuery: contentLoaded');
                updateHeight(true);
            });
            
            $(document).on('action:ajaxify.end', () => {
                console.log('[iframe-height-notifier] jQuery: ajaxify.end');
                updateHeight(true);
            });
            
            $(document).on('action:posts.loaded', () => {
                console.log('[iframe-height-notifier] jQuery: posts.loaded');
                updateHeight(true);
            });
            
            return true;
        }
        return false;
    }
    
    // Try to setup NodeBB hooks with timeout
    function initNodeBBHooks() {
        if (!setupNodeBBHooks()) {
            let attempts = 0;
            const maxAttempts = 25; // 5 seconds
            const interval = setInterval(() => {
                attempts++;
                if (setupNodeBBHooks() || attempts >= maxAttempts) {
                    clearInterval(interval);
                }
            }, 200);
        }
        
        // Also setup jQuery listeners as fallback
        if (!setupJQueryListeners()) {
            let attempts = 0;
            const maxAttempts = 25;
            const interval = setInterval(() => {
                attempts++;
                if (setupJQueryListeners() || attempts >= maxAttempts) {
                    clearInterval(interval);
                }
            }, 200);
        }
    }
    
    // Handle image loading
    function initImageLoadListener() {
        document.addEventListener('load', (e) => {
            if (e.target.tagName === 'IMG') {
                console.log('[iframe-height-notifier] Image loaded');
                updateHeight();
            }
        }, true);
    }
    
    // Handle pagination and navigation clicks
    function initClickListener() {
        document.addEventListener('click', (e) => {
            let target = e.target;
            // Check if clicked element or its parent is a pagination link or navigation element
            while (target && target !== document) {
                if (target.classList && (
                    target.classList.contains('page-link') || 
                    target.closest('.pagination') ||
                    target.closest('[component="pagination"]') ||
                    target.closest('[component="category"]') ||
                    target.closest('[component="topic"]')
                )) {
                    console.log('[iframe-height-notifier] Navigation click detected');
                    // Schedule multiple height updates to catch content loading
                    setTimeout(() => updateHeight(true), 300);
                    setTimeout(() => updateHeight(true), 600);
                    setTimeout(() => updateHeight(true), 1000);
                    setTimeout(() => updateHeight(true), 1500);
                    break;
                }
                target = target.parentElement;
            }
        });
    }
    
    // Initialize everything
    function init() {
        console.log('[iframe-height-notifier] Initializing...');
        disableScrolling();
        
        // Listen for messages from parent
        window.addEventListener('message', handleParentMessage);
        
        // Initialize observers
        initObservers();
        
        // Setup NodeBB hooks
        initNodeBBHooks();
        
        // Listen for image loads
        initImageLoadListener();
        
        // Listen for navigation clicks
        initClickListener();
        
        // Initial height (will only send after parent origin is received)
        if (document.readyState === 'complete') {
            setTimeout(() => updateHeight(true), 200);
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => updateHeight(true), 300);
            });
        }
    }
    
    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
        observers.forEach(observer => {
            if (observer.disconnect) observer.disconnect();
        });
        clearTimeout(debounceTimer);
        clearTimeout(stableTimer);
    });
    
    // Start initialization
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
</script>

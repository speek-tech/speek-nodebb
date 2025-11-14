<script>
(function() {
    'use strict';
    
    // Only run if we're in an iframe
    if (window.self === window.top) {
        return;
    }

    let lastUrl = window.location.pathname + window.location.search;

    // Function to notify parent of URL change
    function notifyUrlChange() {
        const currentUrl = window.location.pathname + window.location.search;
        
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            
            // Send message to parent window
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'urlChange',
                    url: currentUrl,
                    pathname: window.location.pathname,
                    search: window.location.search
                }, '*'); // In production, replace '*' with your actual domain
            }
        }
    }

    // Send initial URL
    notifyUrlChange();

    // Monitor for URL changes (for client-side navigation)
    setInterval(notifyUrlChange, 500);

    // Also listen for popstate (back/forward button)
    window.addEventListener('popstate', function() {
        setTimeout(notifyUrlChange, 100);
    });

    // Listen for pushState and replaceState
    (function(history) {
        const pushState = history.pushState;
        const replaceState = history.replaceState;

        history.pushState = function() {
            pushState.apply(history, arguments);
            notifyUrlChange();
        };

        history.replaceState = function() {
            replaceState.apply(history, arguments);
            notifyUrlChange();
        };
    })(window.history);
})();
</script>


<!-- Lucide Icons - Load early without defer -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>

<script defer src="{relative_path}/assets/nodebb.min.js?{config.cache-buster}"></script>

{{{each scripts}}}
<script defer type="text/javascript" src="{scripts.src}"></script>
{{{end}}}

<script>
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', prepareFooter);
    } else {
        prepareFooter();
    }

    function prepareFooter() {
        {{{ if useCustomJS }}}
        {{customJS}}
        {{{ end }}}

        $(document).ready(function () {
            app.coldLoad();
            
            // Initialize Lucide icons using the lucideInit module
            require(['lucideInit'], function(lucideInit) {
                lucideInit.init();
            });
        });
    }
</script>
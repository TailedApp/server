<script lang="ts" context="module">
    import { AnsiUp } from 'ansi_up';
    const ansi_up = new AnsiUp();
</script>

<script lang="ts">
    import type { ConsoleLine } from './ConsoleLine';
    export let line: ConsoleLine;
</script>

<style type="text/css">
</style>
<span id={`span_${line.id}`}>{@html ansi_up.ansi_to_html(line.content)}</span>
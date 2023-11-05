<script lang="ts">
    import { inview } from 'svelte-inview';

    let spacer: HTMLDivElement;
    let finished: boolean;
    $: finished = false;

    const handleChange = ({detail}: CustomEvent<ObserverEventDetails>) => {
        if (!finished)
            finished = !detail.inView;
    }
</script>

<style type="text/css">
    .spacer-big {
        height: 100.001vh;
    }

    .spacer-small {
        height: 50px;
    }
</style>
<div bind:this={spacer} use:inview on:inview_change={handleChange} class={finished ? 'spacer-small' : 'spacer-big'}></div>
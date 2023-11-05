<script lang="ts">
    import { inview } from 'svelte-inview';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
    let isAnchored: boolean;
    $: isAnchored = false;

    let anchor: HTMLDivElement;

    export function isCurrentlyAnchored() {
        return isAnchored;
    }

    export function scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
    }

    const handleChange = ({detail}: CustomEvent<ObserverEventDetails>) => {
        isAnchored = detail.inView;

        dispatch('anchored', isAnchored);
    }
</script>

<style type="text/css">
    .anchor {
        height: 20px;
        width: 100px;
        position: absolute;
        bottom: 0;
        left: 0;
    }

    .spacer {
        height: 30px;
    }
</style>
<div class="anchor" bind:this={anchor} use:inview on:inview_change={handleChange} />
<div class="spacer"></div>
<script lang="ts">
    export let visible: boolean;
    let button: HTMLButtonElement;

    function onClick() {
        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
        visible = false;
    }
</script>

<style type="text/css">
    .latest {
        position: fixed;
        bottom: 0;
        left: 0;
        z-index: 1000;
        width: 100%;
        text-align: right;
        background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, 1));
    }

    button {
        font-family: 'Roboto Mono';
        font-size: 18px;
        background-color: var(--ansi-black);
        border: 1px solid black;
        color: var(--ansi-white);
        padding: 5px;
        margin: 30px;
        cursor: pointer;
    }

    button img {
        width: 15px;
        vertical-align: text-bottom;
    }

    .bottomSpacer {
        height: 50px;
    }
</style>

<div class="bottomSpacer"></div>

<div class="latest">
    {#if visible}
        <button bind:this={button} on:click={onClick} >Latest <img alt="" src="/logo_white.svg" />
        </button>
    {/if}
</div>
<script lang="ts">
    import { onMount } from 'svelte';
    import { Message } from './Worker';
    import QrCode from '@castlenine/svelte-qrcode';
    import ShortUniqueId from 'short-unique-id';
    import { copy } from 'svelte-copy';
    import type { RuleListItem } from './RuleListItem';

    let worker: Worker | undefined = undefined;

    let ruleList: RuleListItem[];
    $: ruleList = [];

    const generator = new ShortUniqueId({ length: 22 });

    const loadWorker = async () => {
        const response = await fetch('/rules/index.json');
        ruleList = await response.json() as RuleListItem[];

        const w = await import('./Worker?worker');
        worker = new w.default();
    };

    onMount(loadWorker);

    let tab = 0;
    $: tab = 0;

    let fileHandle: FileSystemFileHandle | undefined;
    $: fileHandle = undefined;

    let tailing: boolean;
    $: tailing = false;

    let id: string;
    $: id = '';

    let dropZone: HTMLDivElement;
    let rules = 'none';

    async function handleDrop(e: DragEvent) {
        e.preventDefault();

        if (dropZone.classList.contains('drop-over'))
            dropZone.classList.remove('drop-over');

        const files = e.dataTransfer?.items;

        if (!files || files.length == 0)
            return;

        const entry = files[0];

        if (entry.kind !== 'file')
            return;

        fileHandle = await entry.getAsFileSystemHandle() as FileSystemFileHandle;
    }

    function handleDragOver(e: DragEvent) {
        e.preventDefault();
    }

    function handleDragEnter(e: DragEvent) {
        dropZone.classList.add('drop-over');
    }

    function handleDragLeave(e: DragEvent) {
        dropZone.classList.remove('drop-over');
    }

    function onChange(e: MouseEvent) {
        e.preventDefault();

        if (dropZone.classList.contains('drop-over'))
            dropZone.classList.remove('drop-over');

        fileHandle = undefined;
    }

    async function onChoose(e: MouseEvent) {
        e.preventDefault();
        
        try {
            const [handle] = await window.showOpenFilePicker({ multiple: false });
            fileHandle = handle;
        }
        catch(e) {
            console.log(e);
        }
    }

    function onTail(e: MouseEvent) {
        if (!fileHandle)
            return;

        tailing = true;
        id = generator.randomUUID();

        postMessage(new Message(id, 'start', rules, fileHandle!));
    }

    function onStop(e: MouseEvent) {
        tailing = false;
        postMessage(new Message(id, 'stop', rules, fileHandle!));
    }

    function isFileSystemEnabled(): boolean {
        // Work around TypeScript compile-time warnings about showOpenFilePicker
        // never being undefined, since it really will be undefined in Firefox or
        // Brave in its default configuration.
        const w = window as any;
        return w.showOpenFilePicker !== undefined;
    }
</script>

<style type="text/css">
    #content {
        font-family: Roboto;
        font-size: 1.1em;
        max-width: 70%;
        margin: auto;
    }

    .logo {
        font-weight: bold;
        font-size: 2.5em;
        margin: 20px 0 20px 0;
        text-align: center;
    }

    .logo img {
        width: 50px;
        vertical-align: text-bottom;
    }

    .strapline {
        text-align: center;
    }

    .tabs {
        margin: 50px 0 0 0;
        text-align: center;
    }

    .tabs button {
        font-size: 1.2em;
        border: 0;
        color: var(--ansi-white);
        background-color: #363434;
        width: 180px;
        padding: 10px;
        cursor: pointer
    }

    .tabs button.active {
        color: #363434;
        background-color: var(--ansi-white);
    }

    .tab-content {
        max-width: 50%;
        margin: auto;
        padding-top: 30px;
    }

    #config {
        text-align: center;
    }

    #drop-canvas {
        background-color: black;
        width: 600px;
        height: 200px;
        text-align: center;
        display: table-cell;
        vertical-align: middle;
        padding: 20px;
    }

    :global(.drop-over) {
        border: 2px solid rgb(119, 119, 169);
        background-color: rgb(63, 63, 83) !important;
    }

    #rules {
        font-size: 1.0em;
        width: 300px;
        padding: 5px;
        background-color: var(--ansi-white);
    }

    .button-container {
        margin-top: 50px;
    }

    #tail {
        font-size: 1.1em;
        border: 0;
        padding: 10px 20px 10px 20px;
        cursor: pointer;
        background-color: var(--ansi-green);
        color: var(--ansi-bright-white);
    }

    #tail:disabled {
        background-color: #8ca08c;
        cursor: default;
    }

    a {
        color: var(--ansi-white);
    }

    a:visited {
        color: var(--ansi-white);
    }

    .filename {
        font-family: 'Roboto Mono';
        padding-right: 10px;
    }

    #spinner {
        margin-top: 50px;
        width: 40px;
    }

    #stop {
        margin-top: 25px;
        font-size: 1.1em;
        border: 0;
        padding: 10px 20px 10px 20px;
        cursor: pointer;
        background-color: var(--ansi-red);
        color: var(--ansi-bright-white);
    }

    #copy {
        border: 0;
        background-color: #00000000;
        cursor: pointer;
    }

    #copy img {
        width: 20px;
        vertical-align: middle;
    }
</style>

<div id="content">
    <div class="logo">
        <img src="/logo_white.svg" alt="Tailed logo" /> Tailed
    </div>
    <div class="strapline">
        <p>Simple and quick monitoring of short-term processes over the web.</p>
        <p><a href="https://docs.tailed.live" target="_blank">Read the Documentation</a></p>
    </div>

    <div class="tabs">
        <button class:active={tab == 0} on:click={() => tab = 0}>Zero Install</button>
        <button class:active={tab == 1} on:click={() => tab = 1}>CLI</button>
        <button class:active={tab == 2} on:click={() => tab = 2}>In-Process</button>
    </div>

    <div class="tab-content">
        {#if tab == 0}
            <div id="config">
                {#if (isFileSystemEnabled())}
                    {#if (!tailing)}
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <div bind:this={dropZone} id="drop-canvas" on:drop={handleDrop} on:dragover={handleDragOver} on:dragenter={handleDragEnter} on:dragleave={handleDragLeave}>
                            {#if !fileHandle}
                                <p>Drag a log file here or <a href="/" on:click={onChoose}>click to choose one</a>.</p>
                            {:else}
                                <p><span class="filename">{fileHandle?.name}</span> <a href="/" on:click={onChange}>(change)</a> </p>
                            {/if}
                        </div>

                        <p>Optionally, choose some highlighting rules to be applied:</p>
                        <select id="rules" bind:value={rules}>
                            <option value="none" selected>None</option>
                            
                            {#each ruleList as rule}
                                <option value={rule.id}>{rule.name}</option>
                            {/each}
                        </select>

                        <div class="button-container">
                            <button id="tail" on:click={onTail} disabled={!fileHandle}>Start tailing!</button>
                        </div>
                    {:else}
                        <div id="details">
                            <p><QrCode content={`https://tailed.live/${id}`} color="var(--ansi-white)" backgroundColor="var(--ansi-black)" size={250} /></p>
                            <p class="filename"><a href={`https://tailed.live/${id}`} target="_blank">{`https://tailed.live/${id}`}</a> 
                            <button id="copy" title="Copy URL" use:copy={`https://tailed.live/${id}`}>
                                <img src="/copy.svg" alt="Copy" />
                            </button>
                        </div>
                        <div>
                            <img id="spinner" src="/spinner.gif" alt="spinner" />
                            <p>Tailing <span class="filename">{fileHandle?.name}</span></p>
                            <button id="stop" on:click={onStop}>Stop</button>
                        </div>
                    {/if}
                {:else}
                    <div id="drop-canvas">
                        <p>This feature currently only works in Chromium-based browsers with the File System API enabled.</p>
                    </div>
                {/if}
            </div>
        {:else if tab == 1}
            <div>
                Tab 2
            </div>
        {:else if tab == 2}
            <div>
                Tab 3
            </div>
        {/if}
    </div>
</div>
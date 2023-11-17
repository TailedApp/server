<script lang="ts">
    import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
    import Spacer from './Spacer.svelte';
    import Anchor from './Anchor.svelte';
    import { ConsoleLine } from './ConsoleLine';
    import RenderedLine from './RenderedLine.svelte';
    import { onMount } from 'svelte';
    import Latest from './Latest.svelte';

    let anchor: Anchor;
    let lines: ConsoleLine[];
    $: lines = [];
    let lastLine: ConsoleLine | undefined;
    let spanIndex = 0;
    let latestVisible: boolean;
    let initialAnchor = false;
    let scrollPosition = 0;
    let locked = true;

    window.onscroll = () => {
        const s = window.scrollY;

        if (s < scrollPosition) {
            console.log('Unlocked');
            locked = false;
        }

        scrollPosition = s;
    }

    $: latestVisible = false;
    
    const maxRows = 1000;
    const tailId = window.location.pathname.replace('/', '');

    const connection = new HubConnectionBuilder()
            .withUrl('/api/tail')
            .configureLogging(LogLevel.Information)
            .build();

    async function start() {
        try {
            await connection.start();
            await connection.invoke('Join', tailId);
            console.log(`Connected to tail '${tailId}' and awaiting data..`);
        } catch (err) {
            console.log(err);
            setTimeout(start, 5000);
        }
    };

    connection.onclose(async () => {
        await start();
    });

    connection.on('ReceiveData', (data: string) => {
        const parts = data.split('\n');

        for (let i = 0; i < parts.length; i++) {
            if (i != parts.length - 1)
                parts[i] += '\n';

            if (lastLine) { 
                // Existing line
                lastLine.appendText(parts[i]);
                lines = lines;

                if (parts[i].indexOf('\n') != -1)
                    lastLine = undefined;
            }
            else {
                // A new line of text.
                lastLine = new ConsoleLine(spanIndex, parts[i]);
                lines.push(lastLine);
                spanIndex++;

                if (lines.length > maxRows && locked) {
                    lines = lines.slice(maxRows * -1);
                }
                else {
                    lines = lines;
                }
            }

            if (locked) {
                anchor.scrollToBottom();
            }
        }
    });

    onMount(async() => {
        anchor.scrollToBottom();
        await start();
    });

    function onAnchored(event: CustomEvent<boolean>) {
        latestVisible = !event.detail;

        if (!latestVisible) {
            console.log('Locked');
            locked = true;
        }

        if (latestVisible && locked) {
            anchor.scrollToBottom();
        }

        if (!initialAnchor && lines.length == 0 && latestVisible) {
            // Safari and iOS workaround
            initialAnchor = true;
            anchor.scrollToBottom();
        }
    }
</script>

<style type="text/css">
    pre {
        position: relative;
        font-family: 'Roboto Mono';
        font-size: 14px;
        font-weight: bold;
        line-height: 1.4em;
    }

    /* tablet styles */
    @media screen and (min-width: 768px) {
        pre {
            font-size: 10px;
        }
    }

    /* desktop styles */
    @media screen and (min-width: 1024px) {
        pre {
            font-size: 16px;
        }
    }
</style>

<pre><Spacer />{#each lines as line}<RenderedLine bind:line={line} />{/each}<Anchor bind:this={anchor} on:anchored={onAnchored} /></pre>

<Latest visible={latestVisible} />
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import type { Rule } from './Rule';
import { colorToAnsi, ColorPosition, Color } from './Colors';

export class Message {
    id: string;
    type: string;
    rules: string;
    value: FileSystemFileHandle;

    constructor(id: string, type: string, rules: string, value: FileSystemFileHandle) {
        this.id = id;
        this.type = type;
        this.rules = rules;
        this.value = value;
    }
}

let index = 0;
let lastFileSize = 0;
let restarts = -1;
let running = false;
let backoff = 0;
let connection: HubConnection;

const decoder = new TextDecoder();

onmessage = async (e) => {
    const message = e.data as Message;

    if (message.type === 'start') {
        index = 0;
        lastFileSize = 0;
        restarts = -1;
        running = true;
        await doRead(message.id, message.rules, message.value);
    }
    else if (message.type === 'stop' ) {
        running = false;
        console.log(`Total restarts: ${restarts}`);
    }
}

async function doRead(id: string, rule_set: string, reference: FileSystemFileHandle) {
    try {
        connection = new HubConnectionBuilder()
            .withUrl(`/api/tail`)
            .configureLogging(LogLevel.Warning)
            .build();

        await connection.start();

        let rules: Rule[] = [];
        
        if (rule_set !== 'none') {
            const response = await fetch(`/rules/${rule_set}.json`);
            rules = await response.json() as Rule[];
        }

        while (running) {
            try {
                restarts++; 

                const file = await reference.getFile();
                const fileSize = file.size;
            
                if (fileSize == lastFileSize) {
                    backoff = backoff == 5000 ? 5000 : backoff + 500;
                    await new Promise((resolve, _) => setTimeout(resolve, backoff));
                    continue;
                }
                else if (fileSize < lastFileSize && fileSize > 0) {
                    console.log('File truncated');
                    index = 0;
                }
            
                backoff = 0;
                lastFileSize = fileSize;
            
                const stream = file.stream();
                const reader = stream.getReader();
            
                let currentIndex = 0;
            
                while (running) {
                    const { done, value} = await reader.read();
            
                    if (value) {
                        currentIndex += value.length;
            
                        if (currentIndex > index) {
                            if (rules.length > 0) {
                                const raw = decoder.decode(value.slice(index - currentIndex));
                                const lines = raw.split('\n');
    
                                for (let i = 0; i < lines.length; i++) {
                                    for (let rule of rules) {
                                        lines[i] = processRule(lines[i], rule);
                                    }
                                }

                                connection.invoke('SendData', id, lines.join('\n'));
                            }
                            else {
                                connection.invoke('SendData', id, decoder.decode(value.slice(index - currentIndex)));
                            }

                            index = currentIndex;
                        }
                    }
            
                    if (done) {
                        break;
                    }
                }
            }
            catch(ex: any) {
                if (ex.message !== 'network error')
                    throw ex;
            }
        }
    }
    catch(e) {
        console.log(e);
    }
    finally {
        await connection.stop();
    }
}

function processRule(line: string, rule: Rule): string {
    const r = new RegExp(rule.pattern, `d${rule.ignore_case ? 'i' : ''}${rule.first_only ? '' : 'g'}`);
    const matches = Array.from(RegExp.prototype[Symbol.matchAll].call(r, line)).reverse();
    
    for(let match of matches) {
        if (match.indices?.groups?.c) {
            line = [
                line.slice(0, match.indices.groups.c[0]),
                colorToAnsi(ColorPosition.Background, Color[rule.background as keyof typeof Color]),
                colorToAnsi(ColorPosition.Foreground, Color[rule.foreground as keyof typeof Color]),
                match.groups!.c,
                line.slice(match.indices.groups.c[1], match.indices.groups.c[1]),
                colorToAnsi(ColorPosition.Background, Color.Default),
                colorToAnsi(ColorPosition.Foreground, Color.Default),
                line.slice(match.indices.groups.c[1])
            ].join('');
        }
        else {
            line = [
                line.slice(0, match.indices![0][0]),
                colorToAnsi(ColorPosition.Background, Color[rule.background as keyof typeof Color]),
                colorToAnsi(ColorPosition.Foreground, Color[rule.foreground as keyof typeof Color]),
                match,
                line.slice(match.indices![0][1], match.indices![0][1]),
                colorToAnsi(ColorPosition.Background, Color.Default),
                colorToAnsi(ColorPosition.Foreground, Color.Default),
                line.slice(match.indices![0][1])
            ].join('');
        }
    }

    return line;
}
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

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

async function doRead(id: string, rules: string, reference: FileSystemFileHandle) {
    try {
        connection = new HubConnectionBuilder()
            .withUrl(`/api/tail`)
            .configureLogging(LogLevel.Warning)
            .build();

        await connection.start();

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
                            index = currentIndex;
                            if (rules !== 'none') {
                                const raw = decoder.decode(value.slice(index - currentIndex));
                                const lines = raw.split('\n');
    
                                for (let i = 0; i < lines.length; i++) {
                                    // TODO: apply colorization rules
                                    
                                }
    
                                connection.invoke('SendData', id, lines.join('\n'));
                            }
                            else {
                                connection.invoke('SendData', id, decoder.decode(value.slice(index - currentIndex)));
                            }
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
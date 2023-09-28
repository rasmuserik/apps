export async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function shuffled(a) {
    let input = [...a];
    let output = [];
    while (input.length > 0) {
        let pos = Math.random() * input.length | 0;
        output.push(input[pos]);
        input[pos] = input[input.length - 1];
        input.pop();
    }
    return output;
}


// connnect to websocket server

let connected = false;
let timeout = 0;
let ws;
async function connect() {
  for(;;) {
    await sleep(timeout);
    if(connected) return;
    timeout += 2000;
    if(ws) ws.close();
    ws = new WebSocket("wss://ws.veduz.com/ws/");
    ws.onopen = () => {
      console.log("connected");
      connected = true;
    };
    ws.onmessage = (e) => onmessage(e.data);
    ws.onerror = (e) => console.log('wss error', e);
    ws.onclose = (e) => {
      console.log("wss closed", e);
      connected = false;
      connect();
    }
  }
}
connect();
function onmessage(msg) {
  console.log("message", msg)
}

export function setStyle(name, style) {
    let elem = document.querySelector("#" + name)
    if (!elem) {
          elem = document.createElement("style");
          elem.id = name;
          document.head.appendChild(elem);
        }
    elem.innerHTML = style;
}


export function log(type, data) {
  console.log(type, data)
  ws.send(JSON.stringify({type: 'log', data: {type, ... data}}));
}

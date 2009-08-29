/* Worker */

ActorWorker = {
  act: function(message) {
    switch (message.type) {
      // the start and end messages could be used to control long running calculations
      case "start":
        this.start();
        break;
      case "end":
        this.end();
        break;
      case "log":
        this.log(message.data);
        break;
      default:
        this.receive(message);
        break;
    }
  },
  
  start: function() {
  },
  
  end: function() {
  },
  
  send: function(message) {
    postMessage(message);
  },
  
  receive: function(message) {
  },
  
  // helper function because neither Firebug's nor Safari's console.log method works inside of a Worker
  log: function(message) {
    postMessage({type: "log", data: message});
  } 
}

// the onmessage callback takes the Web Worker message object, not the ActorWorker message object, the latter being the former's message.data property
self.onmessage = function(message) {
  ActorWorker.act(message.data);
}
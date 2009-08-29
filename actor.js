/* Listener/manager */

// the Actor class
function Actor() {
  // every Actor is identified by a unique id
  this.id = Math.round((new Date()) * Math.random() * 1000);
  this.listeners = [];
  
  // if the arguments array isn't empty, we were passed a filename for the Worker
  if (arguments.length > 0) {
    this.filename = arguments[0];
  } else {
    this.filename = "actorworker.js"; // the default Worker name
  }
}

// Create the Actor method which responds to incoming messages
// Use a closure so that act can be used as the onmessage callback and still access the Actor object's properties
Actor.prototype.createAct = function() {
  var actor = this;
  return function(message) {
    var message = message.data;
    switch (message.type) {
      case "start":
        actor.ActorWorker.send({type: "start"});
        break;
      case "end":
        actor.ActorWorker.send({type: "end"});
        break;
      case "log":
        console.log(message.data);
        break;
      default:
        actor.receive(message);
        break;
    }
  };
}

// The Actor method which responds to incoming messages, without closures
Actor.prototype.act = function(message) {
  var message = message.data;
  switch (message.type) {
    case "start":
      this.ActorWorker.send({type: "start"});
      break;
    case "end":
      this.ActorWorker.send({type: "end"});
      break;
    case "log":
      console.log(message.data);
      break;
    default:
      this.receive(message);
      break;
  }
}

// Send a message to the Actor
Actor.prototype.send = function(message) {
  this.ActorWorker.postMessage(message);
}

// The Actor has received a message, usually from its ActorWorker or another Actor it's listening to
Actor.prototype.receive = function(message) {
  // perform any desired operations in response to the message here (perhaps sending it off to the ActorWorker)
  
  // notify the Actor's listeners of the message
  this.listeners.forEach(function(listener) {
    listener.receive(message);
  });
}

// Add an Actor to this Actor's listeners object
Actor.prototype.addListener = function(listener) {
  this.listeners.push(listener);
}

// Remove the Actor identified by the unique id from this Actor's listeners object
Actor.prototype.removeListener = function(id) {
  return (delete this.listeners[id]);
}

// Start the Actor
// Add our Web Workers in the start function to mimic the Scala library, rather than doing it in the constructor
Actor.prototype.start = function() {
  this.ActorWorker = new Worker(this.filename);
  this.ActorWorker.onmessage = this.createAct();
  this.ActorWorker.onerror = function(error) {
    console.log("Actor error in " + error.filename + ", line " + error.lineno + ": " + error.message);
    // event.preventDefault();
  }
  this.ActorWorker.postMessage({type: "start"});
}

// Start the Actor, with closures
// This method is useful if you wish to have the Actor's start be an event callback
Actor.prototype.createStart = function() {
  var actor = this;
  return function() {
    actor.ActorWorker = new Worker(actor.filename);
    actor.ActorWorker.onmessage = actor.createAct();
    actor.ActorWorker.onerror = function(error) {
      console.log("Actor error in " + error.filename + ", line " + error.lineno + ": " + error.message);
      // event.preventDefault();
    }
    actor.ActorWorker.postMessage({type: "start"});
  }
}

// End the Actor
Actor.prototype.end = function() {
  this.ActorWorker.postMessage({type: "end"});
}

// End the Actor, with closures
// Use closures so that we can use this function as a callback and still access the Actor object
Actor.prototype.createEnd = function() {
  var actor = this;
  return function() {
    actor.ActorWorker.postMessage({type: "end"});
  };
}

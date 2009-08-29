/* Worker */

importScripts("actorworker.js");

ActorWorker.start = function() {
  var actor = this;
  // the actor will send the current UNIX timestamp every 1000 milliseconds
  this.interval = setInterval(
    function() {
      actor.send({type: "time", data: (new Date()).getTime()});
    }, 1000
  );
}

ActorWorker.end = function() {
  clearInterval(this.interval);
}

self.onmessage = function(message) {
  ActorWorker.act(message.data);
}
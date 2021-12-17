
const start = () => {
  const url = document.querySelector('input').value
  if (url) {
    const ros = new ROSLIB.Ros({ url: url });

    ros.on('connection', () => {
      console.log('connected')

      const publisher = new ROSLIB.Topic({
        ros: ros,
        name:"/usr_cmd",
        messageType: 'string'
      });

      const send = (message) => {
        publisher.publish(message)
      }

      document.addEventListener("keydown",(event) => {
        console.log("sending event")
        switch (event.key) {
          case "Down": // IE/Edge specific value
          case "ArrowDown":
            send("back")
            break;
          case "Up": // IE/Edge specific value
          case "ArrowUp":
            send("forward")
            break;
          case "Left": // IE/Edge specific value
          case "ArrowLeft":
            send("left")
            break;
          case "Right": // IE/Edge specific value
          case "ArrowRight":
            send("right")
            break;
        }

        event.preventDefault();
      });

      document.addEventListener("keyup", (event) => {
        send("stop");
        event.preventDefault();
      });
    });
  }
}
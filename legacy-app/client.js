let shutdown = () => console.warn("not connected!")
const start = () => {
  const url = document.querySelector('input').value
  if (url) {
    const ros = new ROSLIB.Ros({ url: `ws://${url}:9090` });

    ros.on('connection', () => {
      console.log('connected')

      const publisher = new ROSLIB.Topic({
        ros: ros,
        name:"/usr_cmd",
        messageType: 'std_msgs/String'
      });

      new MJPEGCANVAS.Viewer({
        divID : 'mjpeg',
        host : url,
        width : 640,
        height : 480,
        topic : '/image_raw'
      });

      const send = (message) => {
        const msg = new ROSLIB.Message({data: message});
        publisher.publish(msg);
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

      shutdown = () => send("shutdown")
    });
  }
}
const url = "https://" + process.env.PROJECT_DOMAIN + ".glitch.me"
const port = 3000;
const express = require("express");
const app = express();
var exec = require("child_process").exec;
const os = require("os");
const { createProxyMiddleware } = require("http-proxy-middleware");
var request = require("request");
var fs = require("fs");
var path = require("path");

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/status", (req, res) => {
  let cmdStr = "ps -ef";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.type("html").send("<pre>Command line execution error:\n" + err + "</pre>");
    } else {
      res.type("html").send("<pre>Command line execution result:\n" + stdout + "</pre>");
    }
  });
});

app.get("/start", (req, res) => {
  let cmdStr =
    "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Command line execution error:" + err);
    } else {
      res.send("Command line execution result:" + "Launch successful!");
    }
  });
});

app.get("/info", (req, res) => {
  let cmdStr = "cat /etc/*release | grep -E ^NAME";
  exec(cmdStr, function (err, stdout, stderr) {
    if (err) {
      res.send("Command line execution error:" + err);
    } else {
      res.send(
        "Command line execution result:\n" +
        "Linux System:" +
        stdout +
        "\nRAM:" +
        os.totalmem() / 1000 / 1000 +
        "MB"
      );
    }
  });
});

app.get("/test", (req, res) => {
  fs.writeFile("./test.txt", "Here are the contents of the newly created files!", function (err) {
    if (err) res.send("Failed to create file with read-only file system permissions: " + err);
    else res.send("File created successfully with non-read-only file system permissions.");
  });
});

app.get("/download", (req, res) => {
  download_web((err) => {
    if (err) res.send("Failed to download file");
    else res.send("Download file successfully");
  });
});

app.use(
  "/",
  createProxyMiddleware({
    target: "http://127.0.0.1:8080/",
    changeOrigin: true,
    ws: true,
    pathRewrite: {
      "^/": "/",
    },
    onProxyReq: function onProxyReq(proxyReq, req, res) { },
  })
);

/* keepalive  begin */
function keepalive() {
  exec("curl -m5 " + url, function (err, stdout, stderr) {
    if (err) {
      console.log("Request Home - Command line execution error:" + err);
    } else {
      console.log("Request Home - Command line execution successful, response message:" + stdout);
    }
  });

  exec("curl -m5 " + url + "/status", function (err, stdout, stderr) {
    if (!err) {
      if (stdout.indexOf("./web.js -c ./config.json") != -1) {
        console.log("web is running");
      } else {
        exec(
          "chmod +x ./web.js && ./web.js -c ./config.json >/dev/null 2>&1 &",
          function (err, stdout, stderr) {
            if (err) {
              console.log("Call up the web - Command line execution error:" + err);
            } else {
              console.log("Call up the web - Command line execution successful!");
            }
          }
        );
      }
    } else console.log("Call up the web - Request server process table - command line execution error:" + err);
  });
}
setInterval(keepalive, 9 * 1000);
/* keepalive  end */

function download_web(callback) {
  let fileName = "web.js";
  let web_url = "https://suo.yt/d2UNoQE";
  let stream = fs.createWriteStream(path.join("./", fileName));
  request(web_url)
    .pipe(stream)
    .on("close", function (err) {
      if (err) callback("Failed to download file");
      else callback(null);
    });
}
download_web((err) => {
  if (err) console.log("Initialization - Download web file failed");
  else console.log("Initialization - Download web file successfully");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
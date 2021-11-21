
http = require('http')

const hostname = '127.0.0.1';
const port = 3000;

console.log("Hello from the node app")
fs = require('fs')

function requestListener(req, res){
    const url = req.url
    const method = req.method

    if (url === '/'){
        res.write('<html>');
        res.write('<head><title>Enter Message</title><head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end()
    }

    if (url === '/message' && method === 'POST'){
        const body = []
        //on allows us to listen to certain events
        //data event s filed whenever a new buffer chunk is ready to be read
        req.on('data', (chunk) => {
            console.log(chunk)
            body.push(chunk)
        });

        //fired once all incoming data has been read
        return req.on('end', () => {
            //create a new buffer and add all chunks into it
            const parsedBody = Buffer.concat(body).toString()
            console.log(parsedBody)
            const message = parsedBody.split("=")[1]
            // fs.writeFileSync('message.txt', message);
            //writeFileSync => sync is synchronous => will block execution until file is created.
            //Add status codes here if they depend on computations from your server

            fs.writeFile('message.txt', message, () => {
                res.statusCode = 302
                res.setHeader('Location', '/');
                return res.end();
            });
        })
    }
}


const server = http.createServer(requestListener)

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
})

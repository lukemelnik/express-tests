# Practicing Some Express Functionality

## Notes:

- multer works for for simple uploads but I couldn't pipe it to sharp
- used busboy to pipe the file's readable stream into sharp and then through a writeable stream to disk.
- express-session only stores the sessionId in the cookie, then all data is looked up & modified on the server.
- if you log in multiple times, the session data is overwritten by the sessionId remains the same (because the name of the cookie remains the same, and its presence is detected by the middleware). That's why other cookies won't effect the process.
- only takes a tiny bit of code to see why routes and controller abstractions are the way.
- if you're serving static files with express, any html files in the public folder can still be accessed even if you have rules on the route. Moved them to a views folder.

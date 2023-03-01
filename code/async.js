//An evidence proofs that some of the functions in the node standard library don't seem to use the same kind of thread pool that our hashing function did previously.

const https = require('https');

const start = Date.now();

function doRequest() {
  https
    .request('https://www.google.com', res => {
      res.on('data', () => {});
      res.on('end', () => {
        console.log(Date.now() - start);
      });
    })
    .end();
}

doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
doRequest();
/*
Notice that these 6 calls appear to be completed at the same time.
This is distinctly different behavior than what we saw previously with our thread pool.
So remember, by default the thread pool has four threads, which means only four tasks can be processed at a time.
But in this case we had six tasks all completed simultaneously.

Explanation:
In this case, libuv sees that we are attempting to make an HTTP request.
Neither libuv nor Node has any code to handle all of the super low level operations that are involved with a network request.
Instead, libuv delegates the request-making to the underlying operating system. So it's actually our operating system that does the real HTTP request.
Libuv is used to issue the request and then it just waits on the operating system to emit a signal that some response has come back to the request.

Because libuv is delegating the work done to the operating system, the operating system itself decides whether to make a new thread or not,
or just generally how to handle the entire process of making the request.
So because the operating system is making the request, there is no blocking of our JavaScript code inside of our event loop, or anything else inside of our application.

Everything or all the work is being done by the operating system itself, and we're not touching the thread pool at all in this case.
*/
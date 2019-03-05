# Notes on setting up a PLAAY server

## Set up the Mongo cluster

Set up a Mongo data base cluster on a server. I used Mongo Atlas. Make sure that the security for the Mongo server allows access from the IP(s) of the PLAAY server(s).

The Mongo cluster should be associated with a URI.  With Atlas you get this URI by clicking on connect. We use an older protocol, so the URI starts with

     mongodb://UNAME:PASSWORD@clu...

not with `mongodb+srv:...`.  The `UNAME` and `PASSWORD` parts need to be replaced by the actual username and password for the cluster.

This URI needs to go in a file later. We'll get to that.

## Set up the PLAAY server

### Install

If necessary create a server. I used an EC2 Amazon Machine Instance on Amazon Web Services.

Install `npm`, `node`, and `typescript`.

Use `git clone` to make a clone of PLAAY. In the client source directory run `npm install`.  Do the same in the server directory. 

### Make the .env file

In the server's source directory `...PLAAY-Repo/tsServer` make a new file called `.env`. It should look like this

     MONGOLAB_URI=mongodb://UNAME:PASSWORD@clu...
     SESSION_SECRET=MYSECRET
     PORT=7529

Be sure to replace `UNAME` and `PASSWORD` as described above.  The `MYSECRET` should be replaced with a long random string of letters and digits.  It's used for signing the session cookie; so it's important; see https://martinfowler.com/articles/session-secret.html .

You could use port 80 here, but then the server needs to run with high privilege (on Unix/Linux).  That's likely not a good idea.  (See https://stackoverflow.com/questions/17467696/how-to-run-node-js-as-non-root-user for advice on using `iptables` to change redirect traffic to port 80 to port 7529.)

Whatever port you use.  Make sure it is open to the public.  On Amazon EC2, this is done by modifying the "security group" for your machine instance.

### Start your engine 

If all goes well you can do `npm start` to start the server.





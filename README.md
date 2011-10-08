##static-here
___________
Create a static web server from the current directory.  

###Install using npm:

    npm install static-here
  
###Run static-here to start serving files from the current working directory.  

    static-here
      > Serving files from /badass/javascript/project at http://localhost:8888/

###Optional dependancies:
  
  1. node-mime: Static-here has a built-in small table of mime-types, but having  
      node-mime would make static-here a bit smarter.  
      `npm install node-mime`
  
  2. coffee-script: If you are the coffee-script kind of person, this will make  
      your life easier by optionally watch & (re)-compile `.coffee` files.  

        npm install -g coffee-script
        static-here coffee
        Serving files from /badass/javascript/project at http://localhost:8888/
    
###Options:

  You can specify the port, IP and coffee flag in any order you like:
  
    static-here coffee 8888 0.0.0.0
    static-here 192.168.1.10 8080 coffee
  
  On my Mac, node's `fs.watchFile` is really slow with the default 0ms interval.  
  With An additional option flag `fix` this can be fixed (making the interval to -1).  
  
  Defaults:  
  * Port: 8888
  * IP: 0.0.0.0
  * coffee watching is off by default
  

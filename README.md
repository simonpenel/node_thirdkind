# Thirdkind node server
This is a node server for [thirdkind](https://github.com/simonpenel/thirdkind/wiki)

# Install node
`curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -`
`sudo apt install -y nodejs`

# Install essential build needed by Rust:
`sudo apt install build-essential`

# Install cargo and Rust:

`curl https://sh.rustup.rs -sSf | sh`

`source $HOME/.cargo/env`

`cargo install thirdkind`

test:

`thirdkind`

# Install pm2

`sudo npm install pm2 -g`

# Download server

`git clone https://github.com/simonpenel/node_thirdkind.git`

# Install packages

`cd node_thirdkind/thirdkind_app`

`npm install`

# Launch server

`pm2 start thirdkind.js` (production)

or

`npm start` (test)

# cron command for file cleaning
Removing files older than 1 hour

`find thirdkind_app/uploads/  -name "mypic*" -type f -mmin +59 -delete`

`find thirdkind_app/public/  -name "mypic*" -type f -mmin +59 -delete`


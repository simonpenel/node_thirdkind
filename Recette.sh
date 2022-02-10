# For Rust:
sudo apt install build-essential

# Install node
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install cargo and Rust:

curl https://sh.rustup.rs -sSf | sh
source $HOME/.cargo/env
cargo install thirdkind
thirdkind 

# Install pm2

sudo npm install pm2 -g

# Download server

git clone https://github.com/simonpenel/node_thirdkind.git

# Install packages

cd node_thirdkind/thirdkind_app
npm install

# Lauch server

pm2 start thirdkind.js


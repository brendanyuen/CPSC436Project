#!/bin/bash
# This file is to set up React application on ec2 instance automatically (for auto-scaling)
sudo yum update -y
sudo yum install -y nginx git

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install node

cd /home/ec2-user
git clone https://github.com/brendanyuen/CPSC436Project.git

cd CPSC436Project/ecommerce-app/
echo "REACT_APP_LOGOUT_URI=https://ecommerce-alb-1524232584.ca-central-1.elb.amazonaws.com" > .env

npm install
npm run build

sudo cp -r build/* /usr/share/nginx/html/

sudo systemctl enable nginx
sudo systemctl start nginx

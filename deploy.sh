yarn build
rsync -rvz --delete --force dist/ deploy@greenie.app:/var/www/greenie.app/

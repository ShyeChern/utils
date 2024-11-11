rm -rf ./lib
npx tsc
npx copyfiles -V -a -s -u 1 "./src/**/*" -e "./src/**/*.ts" -e "./src/**/*.js" lib
npm pack
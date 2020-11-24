const fs = require("fs");
const gzip = require('zlib').createGzip();
const babel = require("@babel/core");
const browserify = require('browserify');
const { P } = require("vachan");
const { argv } = require("process");

const transform = P.vachanify(babel.transformFile);

function distGen(filename) {
    // Node dist
    transform(`${__dirname}/src/${filename}.js`, { "presets": ["@babel/preset-env", "minify"], "comments": false })
        .then(result => {
            fs.writeFileSync(`${__dirname}/dist/${filename}.min.js`, result.code);
        })

    // Browser dist
    browserify([`${__dirname}/src/${filename}.js`], { standalone: filename })
        .bundle()
        // .pipe(fs.c reateWriteStream(`${__dirname}/dist/${filename}.dist.js`))
        .on("finish", _ => {
            // `${__dirname}/dist/${filename}.dist.js`
            transform(_, { "presets": ["@babel/preset-env", "minify"], "comments": false })
                .then(result => {
                    fs.writeFileSync(`${__dirname}/dist/${filename}.dist.min.js`, result.code);
                    fs.createReadStream(`${__dirname}/dist/${filename}.dist.min.js`)
                        .pipe(gzip)
                        .pipe(fs.createWriteStream(`${__dirname}/dist/${filename}.dist.min.js.gz`));
                });
        });

}

if (!fs.existsSync(argv[2])) fs.mkdirSync(argv[2]);
argv.slice(3).forEach(distGen);
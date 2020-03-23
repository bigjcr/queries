// simple select
/* 
db.any('select * from words')
    .then(data => {
        console.log('DATA:', data); // print data;
    })
    .catch(error => {
        console.log('ERROR:', error); // print the error;
    })
    .finally(db.$pool.end); // For immediate app exit, shutting down the connection pool
*/

//streaming
/*
    const QueryStream = require('pg-query-stream');
const JSONStream = require('JSONStream');

// you can also use pgp.as.format(query, values, options)
// to format queries properly, via pg-promise;
const qs = new QueryStream('SELECT * FROM words');

db.stream(qs, s => {
        // initiate streaming into the console:
        s.pipe(JSONStream.stringify()).pipe(process.stdout);
    })
    .then(data => {
        console.log('Total rows processed:', data.processed,
            'Duration in milliseconds:', data.duration);
    })
    .catch(error => {
        console.log('ERROR:', error);
    });*/

const { Pool } = require('pg')
const Cursor = require('pg-cursor')

// 100 batch

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '1234',
    database: 'test2',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
})

// how many rows to retrieve at a time
const BATCH_SIZE = 100;

var batches = 0;

pool.connect((err, client, release) => {
    if (err) {
      return console.error('Client error', err.stack)
    }

    ;(async function processOrders(){
    
        const cursor = client.query(new Cursor('SELECT * FROM words'));
        await new Promise((resolve, reject) => {
            (function read() {
                cursor.read(BATCH_SIZE, async (err, rows) => {
                    if (err) {
                        return reject(err);
                    }
            
                    // no more rows
                    if (!rows.length) {
                        return resolve();
                    }
            
                    // process rows
                    console.log(rows);
                    batches++;

                    // next batch
                    return read();
                });
            })();
        });
    
        console.log("Batches: ", batches);
        release()
    })()
})

/*
;(async function(){
    // wrap the whole retrieval in a promise
    const client = await pool.connect()
    function processResults() {
    
        const cursor = client.query(new Cursor('SELECT * FROM words'));
        return new Promise((resolve, reject) => {
        (function read() {
            cursor.read(BATCH_SIZE, async (err, rows) => {
            if (err) {
                return reject(err);
            }
    
            // no more rows, so we're done!
            if (!rows.length) {
                return resolve();
            }
    
            // do something with those rows here...
            console.log(rows);
            // get the next batch
            return read();
            });
        })();
        });
    }
    ;(async function(){
        const isComplete = await processResults();
    })()
})()
*/


// insert
/*
function insertRecords(N) {
    return db.tx(function (ctx) {
        var queries = [];
        for (var i = 1; i <= N; i++) {
            queries.push(ctx.none('insert into words(word) values($1)', 'word-' + i));
        }
        return promise.all(queries);
    });
}
function insertAll(idx) {
    if (!idx) {
        idx = 0;
    }
    return insertRecords(2000)
        .then(function () {
            if (idx >= 9) {
                return promise.resolve('SUCCESS');
            } else {
                return insertAll(++idx);
            }
        }, function (reason) {
            return promise.reject(reason);
        });
}
insertAll()
    .then(function (data) {
        console.log(data);
    }, function (reason) {
        console.log(reason);
    })
    .done(function () {
        pgp.end();
    });
*/
const { Client } = require('pg');

const clientConfig = {
    user: 'postgres',
    password: 'Olanrewaju99!',
    database: 'backend_reddit',
};

const client = new Client(clientConfig);
client.connect();

exports.createSubreddit = async (call, callback) => {
    const { name, description} = call.request.subreddit;
    client.query("INSERT INTO subreddits (name, description) VALUES ($1, $2) returning id", [name, description], (err, res) => {
        if (err) {
            return callback(err, null);
        }
        const response = {
            id: res.rows[0].id,
        };
        return callback(null, response);
    });
};

exports.getSubreddit = async (call, callback) => {
    const { id } = call.request;
    client.query("SELECT id, name, description FROM subreddits WHERE id = $1", [id], (err, res) => {
        if (err) {
            return callback(err, null);
        } else {
            const response = {
                subreddit: {
                    name: res.rows[0].name,
                    description: res.rows[0].description,
                    id: res.rows[0].id, //might not work
                }
            };
            return callback(null, response);
        }
    });
};
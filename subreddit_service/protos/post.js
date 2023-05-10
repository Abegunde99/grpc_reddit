const { Client } = require('pg');

const clientConfig = {
    user: 'postgres',
    password: 'Olanrewaju99!',
    database: 'backend_reddit',
};

const client = new Client(clientConfig);
client.connect();

exports.createPost = async (call, callback) => {
    const { title, description, author, subreddit_id } = call.request.post;
    client.query("INSERT INTO posts (title, description, author, subreddit_id) VALUES ($1, $2, $3, $4) returning id", [title, description, author, subreddit_id], (err, res) => {
        if (err) {
            return callback(err, null);
        }
        const response = {
            id: res.rows[0].id,
        };
        return callback(null, response);
    });
};

exports.getPost = async (call, callback) => {
    const { id } = call.request;
    client.query("SELECT id, title, description, author, subreddit_id FROM posts WHERE id = $1", [id], (err, res) => {
        if (err) {
            return callback(err, null);
        } else {
            const response = {
                post: {
                    title: res.rows[0].title,
                    description: res.rows[0].description,
                    author: res.rows[0].author,
                    subreddit_id: res.rows[0].subreddit_id,
                }
            };
            return callback(null, response);
        }
    });
};

exports.updatePost = async (call, callback) => {
    const { id, post, user_id } = call.request;
    const { title, description } = post;
    client.query("select author from posts where id = $1", [id], (err, res) => {
        if (err) {
            return callback(err, null);
        } else {
            let query, values;
            if (res.rows.length > 0 && res.rows[0].author === user_id) {
                if (title != "" && description != "") {
                    query = "UPDATE posts SET title = $1, description = $2 WHERE id = $3";
                    values = [title, description, id];
                } else if (title != "") {
                    query = "UPDATE posts SET title = $1 WHERE id = $2";
                    values = [title, id];
                } else if (description != "") {
                    query = "UPDATE posts SET description = $1 WHERE id = $2";
                    values = [description, id];
                }
            } else {
                return callback("You are not authorized to update this post", null);
            }
            client.query(query, values, (err, res) => {
                if (err) {
                    return callback(err, null);
                } else {
                    const response = {
                        id
                    };
                    return callback(null, response);
                }
            });
        }
                
    });
   
};

exports.likePost = async (call, callback) => {
    const { id, user_id } = call.request;
    
    client.query("select likes from posts where id = $1", [id], (err, res) => {
        if (err) {
            return callback(err, null);
        } else {
            let likes = res.rows[0].likes;
            if (likes.includes(user_id)) {
                return callback("You have already liked this post", null);
            } else {
                client.query("update posts set likes = likes + 1 where id = $1", [id], (err, res) => {
                    if (err) {
                        return callback(err, null);
                    } else {
                        return callback(null, { id })
                    }
                });
                
            }
        }
    });
}

exports.commentPost = async (call, callback) => {
    const { id, comment, user_id } = call.request;
    client.query("insert into comments (post_id, comment, user_id) values ($1, $2, $3) returning id", [id, comment, user_id], (err, res) => {
        if (err) return callback(err, null);
        else return callback(null, { id: res.rows[0].id });
    });
}
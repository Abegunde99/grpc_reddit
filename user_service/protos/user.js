const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const clientConfig = {
    user: 'postgres',
    password: 'Olanrewaju99!',
    database: 'backend_reddit',
};

const client = new Client(clientConfig);
client.connect();

exports.createUser = async (call, callback) => {
    const { username, email, password } = call.request.user;

    //hash the password
    bcrypt.genSalt(10, (err, salt) => {
        if (err) {
            return callback(err, null);
        }
        bcrypt.hash(password, salt, async (err, hash) => {
            if (err) {
                return callback(err, null);
            }
            client.query("INSERT INTO users (username, email, password) VALUES ($1, $2, $3) returning id", [username, email, hash], (err, res) => {
                if (err) {
                    return callback(err, null);
                }
                const response = {
                    id: res.rows[0].id,
                };
                return callback(null,  response );
            });

        });
    });

};

exports.getUser = async (call, callback) => {
    const { id } = call.request;
    client.query("SELECT id, username,email FROM users WHERE id = $1", [id], (err, res) => {
        if (err) {
            return callback(err, null);
        } else {
            const response = {
                user: {
                    username: res.rows[0].username,
                    email: res.rows[0].email,
                    id: res.rows[0].id
                }
            };
            return callback(null, response);
        }
    });
}

exports.createToken = async function (call, callback)  {
    let user = call.request.user;

    //check if user exists
    client.query("SELECT id,username, password FROM users WHERE email = $1", [user.email], (err, res) => {
        if (err) {
            return callback(err, null);
        } else {
            if (!user.password) {
                return callback(new Error("Password or Email incorrect"), null);
            };
            if (!res.rows[0].password) {
                return callback(new Error("Password or Email incorrect"), null);
            }
            bcrypt.compare(user.password, res.rows[0].password, (err, isMatch) => {
                if (err) {
                    return callback(err, null);
                }
                if (isMatch) {
                    user.id = res.rows[0].id;
                    user.username = res.rows[0].username;
                    jwt.sign(user, "SECRET", { expiresIn: 3600 }, (err, token) => {
                        if (err) {
                            return callback(err, null);
                        }
                        const response = {
                            token,
                        }
                        return callback(null, response);
                    });
                } else {
                    return callback(new Error("Password or Email incorrect"), null);
                }
            });
        }           
    });
}  

exports.isAuthenticated = async (call, callback) => {
    const { token } = call.request;
    jwt.verify(token, "SECRET", (err, user) => {
        if (err) {
            return callback(err, {ok: false});
        }
        const response = {
            ok: true,
            user: user,
        };
        return callback(null, response );
    });
}
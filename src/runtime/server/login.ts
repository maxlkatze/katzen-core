import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) =>  {
    //get username and password inside post json
    const body = await readBody(event);
    const username = body.username;
    const password = body.password;
    //get users from runtime config
    const users = useRuntimeConfig().users;

    //check if user exists
    const user = users.find(user => user.name == username && user.password == password);
    if(!user) {
        return {
            success: false,
            body: {
                message: 'Invalid credentials'
            }
        }
    }
    //generate token
    const token = jwt.sign({username}, 'secret');
    //return token
    return {
        success: true,
        body: {
            token
        }
    }
});

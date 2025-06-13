import jwt from "jsonwebtoken"; 

const gentoken = (userId) => {    
    try {
        return jwt.sign({ id: userId }, process.env.jwt_secret, {
            expiresIn: "10d",
        });
    } catch (error) {
        console.log(error);
        return null;
    }
};

export default gentoken;
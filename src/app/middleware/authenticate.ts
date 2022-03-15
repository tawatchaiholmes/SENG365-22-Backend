import {getPool} from "../../config/db";
import {Request, Response, NextFunction} from "express";

const loginRequired = async (req : Request, res : Response, next:NextFunction) : Promise<void> => {
    const token = req.header('X-Authorization');

    try {
        const result = await findUserIdbyToken(token);
        if (result === null) {
            res.statusMessage = 'Unauthorized';
            res.status(401)
                .send("Unauthorized: Please Login");
        } else {
            req.body.authenticatedUserId = String(result);
            next();
        }

    } catch (err) {
        res.statusMessage = 'Internal Server Error';
        res.status(500)
            .send("Internal Server Error");
    }
};

const findUserIdbyToken = async  (values: string) : Promise<void> => {

    const conn = await getPool().getConnection();
    const query = 'SELECT id FROM user WHERE auth_token = ?';
    const [ result ] = await conn.query( query, [values]);
    if (result.length === 0){
        return null
    } else {
        return result[0].id;
    }

};

export {loginRequired, findUserIdbyToken}

import { Request } from "express";

function getUrlBase(req: Request) {
    return `${req.protocol}://${req.get('host')}`
}

export default getUrlBase;
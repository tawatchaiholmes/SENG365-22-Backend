import * as auctionImage from "../models/auction.images.model";
import * as auction from "../models/auction.model"
import Logger from "../../config/logger";
import {Request, Response} from "express";
import Console from "console";
import {getImageExtension} from "../middleware/imageextention";




const getAuctionImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to get the auction image...'`)
    const id = req.params.id;
    try {
        const result = await auctionImage.getImageA( Number(id) );
        if (result === false) {
            res.status(404)
                .send('Not Found');
        } else {
            res.contentType( result.type );
            res.status( 200 )
                .send( result.photo );
        }
    } catch( err ) {
        if (err.errno === -2 || err.code === 'ENOENT') {
            res.status(404)
                .send('Not Found');
        } else {
            res.status(500)
                .send(`ERROR reading event (Internal Sever Error) ${id}: ${ err }`);
        }
    }
};

const updateAuctionImage = async (req: Request, res: Response) : Promise<void> => {
    Logger.http(`Request to update auction image...'`);

    const image = req.body;
    const auctionId = req.params.id;
    const loginId = req.body.authenticatedUserId;
    const auctionDetails = await auction.getOne( Number(auctionId) );


    if (auctionDetails) {
        const sellerID = auctionDetails[0].sellerId;
        if (Number(loginId) === sellerID) {
            const mimeType = req.header('Content-Type');

            const fileExt: any = await getImageExtension(mimeType);

            if (fileExt !== null){
                if (req.body.length !== undefined) {
                    const existImage = await auctionImage.getImageA( Number(auctionId) );
                    const filename = await auctionImage.storeImageA(image, fileExt);
                    if (existImage) {
                        await auctionImage.updateImageA( Number(auctionId), filename);
                        res.status(200)
                            .send("OK")
                    } else {
                        await auctionImage.updateImageA( Number(auctionId), filename);
                        res.status(201)
                            .send("Created")
                    }
                } else {
                    res.status(400)
                        .send('Bad request: image must be image/jpeg, image/png, image/gif type');
                }
            } else {
                res.status(400)
                    .send('Bad Request: empty image');
            }
        } else {
            res.status(403)
                .json('Forbidden');
        }
    } else {
        res.status(404)
            .json("Auction Not Found");
    }
};

export { getAuctionImage, updateAuctionImage }
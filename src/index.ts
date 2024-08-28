import dotenv from 'dotenv';
dotenv.config();
import "reflect-metadata";
import express, { Request, Response } from 'express';
import { AppDataSource } from "./config/data-source";
import router from './routes';

AppDataSource.initialize().then(async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    app.use(express.json({ limit: '30mb' }));

    app.get("/", (req: Request, res: Response) => {
        return res.json({
            status: "Success OPA",
        });
    });
    
    app.use(router);

    app.listen(port);

    console.log(`Server has started on port ${port}`);

}).catch(error => console.log(error));
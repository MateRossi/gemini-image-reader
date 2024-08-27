import express, { Request, Response } from 'express';

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
    return res.json({
        status: "Success OPA",
    });
});

app.listen(4000, () => console.log("listening on port 4000"));
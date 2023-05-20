import app from "./app.js";
import connectDB from "./db/mongoClient.js";
import Config from "./config/config.js";

const PORT = Config.global.port;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

connectDB();

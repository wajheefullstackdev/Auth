import app from "./src/app.js";
import config from "./src/config/config.js";
import connectDB from "./src/config/db.js";

connectDB();

const port = config.PORT;

app.listen(3000, () => {
    console.log(`Server is running on port ${port}`)
}) 
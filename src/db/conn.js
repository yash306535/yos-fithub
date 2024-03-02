const mongoose =require("mongoose");
const URI="mongodb://127.0.0.1:27017/gym";
mongoose.connect(URI);
const connectDb=async()=>{
    try
    {
        await mongoose.connect(URI);
        console.log("Connction done");
    }catch(error)
    {
        console.error("error in connction");
        process.exit(0);
    }
};
module.exports=connectDb;


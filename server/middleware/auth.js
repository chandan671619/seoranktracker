import jwt from "jsonwebtoken";

// middleware to protect routes
const auth = (req,res,next) =>{
    try{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({message:"No token, authorization denied"});
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();
}
catch(error){
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({success: false, message:"Token is not valid"});

}
}
export default auth;
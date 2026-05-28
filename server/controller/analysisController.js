import Analysis from "../model/Analysis.js";
import { analyzeSeoData } from "../services/geminiService.js";
import { scrapeUrl } from "../services/scraperService.js";

// Analyze the url 
export const analyzeUrl = async (req , res) => {
    try {
        const {url } = req.body;
        if(!url) return res.status(400).json({success:true , message:"url is requried"})

        // validate url format
        let validurl;
        try {
            validurl = new URL(url.startsWith("http") ? url : `https://${url}`);
        } catch (error) {
            return res.status(400).json({success:false , message :"Invalid url format"});
        }
        // create analysis record with pending status
        const analysis = await Analysis.create({userId : req.userId , url :validurl.href,status:"processing"})

        //send immediate response with analysis Id
        res.json({success:true , message:"analysis started " , analysisId : analysis._id})
        // run scrapping and anlaysis in background
        try {
            // step 1 scrap the url 
            const scrapResult =  await scrapeUrl(validurl.href)

            if(!scrapResult.success){
                analysis.status = "failed";
                await analysis.save();
                return;
            }
            //step 2 analyse with gemini ai
            const aiResult = await analyzeSeoData(scrapResult.data)
            if(!aiResult.success){
                analysis.status = "failed";
                await analysis.save()
                return;
            }
            // save result
            analysis.overallScore = aiResult.data.overallScore || 0;
            analysis.categories = aiResult.data.categories || {};
            analysis.metaData = scrapResult.data.metaData || {};
            analysis.headings = scrapResult.data.headings || {};
            analysis.links = scrapResult.data.links || {};
            analysis.images = scrapResult.data.images || {};
            analysis.keywords = scrapResult.data.keywords || [];
            analysis.issues = scrapResult.data.issues || [];
            analysis.loadTime = scrapResult.data.loadTime || 0;
            analysis.pageSize = scrapResult.data.pageSize || 0;
            analysis.wordCount = scrapResult.data.wordCount || 0;
            analysis.status = "completed";

            await analysis.save()


            



        } catch (bgerror) {
            console.error("background analysis error " , bgerror.message)
            try {
                analysis.status = "failed";
                await analysis.save()
            } catch (saveError) {
             console.log("failed to save error" , saveError.message)   
            }
            
        }
    } catch (error) {
        console.error("Analyze the url ", error.message);
        if(!res.headersSent){
            res.status(500).json({success:false , message :"server error"})
        }
    }
}
// get analyze by id
export const getAnalysis = async (req , res) => {
    try{
        const analysis = await Analysis.findOne({_id: req.params.id , userId:req.userId})
        if(!analysis) return res.status(404).json({success:false , message : "Analysis not found"});
        res.json({success:true , analysis});
    }catch(error){
        console.error("get analysis error" , error.message);
        res.status(500).json({success:false , message :"server error"})
    }
}
// get all analyses for user
export const getAnalyses = async (req , res) => {
    try{
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page-1) * limit;

        const analysis = await Analysis.find({ userId:req.userId}).sort({createdAt:-1}).skip(skip).limit(limit).select("-issues -keywords");
        const total = await Analysis.countDocuments({userId:req.userId})
        res.json({success:true , analysis , pagination : {page , limit , total , pages : Math.ceil(total/limit)}})
    }catch(error){
        console.error("get analysis error" , error.message);
        res.status(500).json({success:false , message :"server error"})
    }
}


    // Delete analysis
export const deleteAnalysis = async (req, res) => {
    try {

        await Analysis.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        res.json({
            success: true,
            message: "Analysis deleted"
        });

    } catch (error) {

        console.error(
            "Get analysis error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

import KeywordTracking from "../model/Keywordtracking.js";


// add keyword
export const addKeyword = async (req, res) => {

    try {

        const { keyword, url } = req.body;

        // validation
        if (!keyword || !url) {
            return res.status(400).json({
                success: false,
                message: "Keyword and URL are required"
            });
        }

        // extract domain
        let domain;

        try {

            const formattedUrl =
                url.startsWith("http")
                    ? url
                    : `http://${url}`;

            const urlObj = new URL(formattedUrl);

            domain = urlObj.hostname.replace(
                "www.",
                ""
            );

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: "Invalid URL format"
            });
        }

        // check duplicate
        const existing =
            await KeywordTracking.findOne({
                userId: req.userId,
                keyword: keyword
                    .toLowerCase()
                    .trim(),
                domain
            });

        if (existing) {
            return res.status(400).json({
                success: false,
                message:
                    "You are already tracking this keyword for the specified domain"
            });
        }

        // create tracking
        const tracking =
            await KeywordTracking.create({
                userId: req.userId,
                keyword: keyword
                    .toLowerCase()
                    .trim(),
                url: url.startsWith("http")
                    ? url
                    : `http://${url}`,
                domain,
                status: "checking",
            });

        res.status(201).json({
            success: true,
            message: "Keyword tracking started",
            tracking
        });

        // start background tracking
        keywordtracking(tracking);

    } catch (error) {

        console.log(
            "add keyword error:",
            error.message
        );

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Already exists"
            });
        }

        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};

// get all keywords
export const getkeywords = async (req, res) => {

    try {

        const keywords =
            await KeywordTracking.find({
                userId: req.userId
            })
                .sort({ createdAt: -1 })
                .select("-rankHistory");

        res.json({
            success: true,
            keywords
        });

    } catch (error) {

        console.log(
            "get keywords error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};

// get single keyword
export const getkeyword = async (req, res) => {

    try {

        const tracking =
            await KeywordTracking.findOne({
                _id: req.params.id,
                userId: req.userId
            });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message:
                    "keyword tracking not found"
            });
        }

        // FIXED
        res.json({
            success: true,
            tracking
        });

    } catch (error) {

        console.log(
            "get keyword error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};

// refresh keyword
export const refreshkeyword = async (req, res) => {

    try {

        const tracking =
            await KeywordTracking.findOne({
                _id: req.params.id,
                userId: req.userId
            });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message:
                    "keyword tracking not found"
            });
        }

        tracking.status = "checking";

        await tracking.save();

        res.json({
            success: true,
            message: "rank tracking started"
        });

        keywordtracking(tracking);

    } catch (error) {

        console.log(
            "refresh keyword error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};

// delete keyword
export const deletekeyword = async (req, res) => {

    try {

        const tracking =
            await KeywordTracking.findOneAndDelete({
                _id: req.params.id,
                userId: req.userId
            });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message:
                    "keyword tracking not found"
            });
        }

        res.json({
            success: true,
            message: "keyword tracking deleted"
        });

    } catch (error) {

        console.log(
            "delete keyword error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};

// toggle tracking
export const toggleTracking = async (req, res) => {

    try {

        // FIXED Rank -> KeywordTracking
        const tracking =
            await KeywordTracking.findById(
                req.params.id
            );

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: "Tracking not found"
            });
        }

        // toggle
        tracking.active = !tracking.active;

        await tracking.save();

        res.json({
            success: true,
            message:
                "tracking status updated",
            tracking
        });

    } catch (error) {

        console.log(
            "toggle tracking error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "server error"
        });
    }
};
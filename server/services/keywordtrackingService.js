import { ranktracker } from "./rankTrackerServices.js";

export async function keywordtracking(tracking) {

    try {

        let result;

        for (let attempt = 1; attempt <= 3; attempt++) {

            result = await ranktracker(
                tracking.keyword,
                tracking.domain
            );

            console.log("RESULT:", result);

            // safe check
            if (
                result &&
                result.success &&
                result.data.totalResultsScanned > 0
            ) {
                break;
            }

            // retry delay
            if (attempt < 3) {

                await new Promise((res) =>
                    setTimeout(
                        res,
                        result?.success ? 3000 : 6000
                    )
                );

            }

        }

        // success check
        if (result && result.success) {

            const prev = tracking.currentPosition ?? null;

            const today = new Date();

            today.setHours(0, 0, 0, 0);

            // update current data
            tracking.currentPosition =
                result.data.position;

            tracking.currentPage =
                result.data.page;

            tracking.competitors =
                result.data.competitors || [];

            tracking.lastChecked =
                new Date();

            tracking.status = "completed";

            // debug
            
            console.log("PREV:", prev);
    console.log("CURRENT:", result.data.position);
    console.log("CHANGE:", tracking.positionChange);

            // position change
            tracking.positionChange =
                (
                    prev !== null &&
                    result.data.position !== null
                )
                    ? prev - result.data.position
                    : 0;

            // best position
            if (
                result.data.position !== null &&
                (
                    tracking.bestPosition === null ||
                    result.data.position <
                    tracking.bestPosition
                )
            ) {

                tracking.bestPosition =
                    result.data.position;

            }

            // history entry
            const historyEntry = {

                date: today,

                position:
                    result.data.position,

                page:
                    result.data.page,

                title:
                    result.data.title || "",

                snippet:
                    result.data.snippet || "",

            };

            // update existing day entry
            const idx =
                tracking.rankHistory.findIndex(
                    (h) =>
                        h.date.toDateString() ===
                        today.toDateString()
                );

            if (idx >= 0) {

                tracking.rankHistory[idx] =
                    historyEntry;

            } else {

                tracking.rankHistory.push(
                    historyEntry
                );

            }

        } else {

            tracking.status = "failed";

        }

        await tracking.save();

        return result;

    } catch (err) {

        console.error(
            "rank update error",
            err.message
        );

        tracking.status = "failed";

        await tracking.save().catch(() => {});

        return {

            success: false,

            error: err.message,

        };

    }

}
import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body
    if (content?.trim() === "") {
        throw new ApiError(400, "Content is required")
    }


    try {
        const tweet = await Tweet.create({
            content:content,
            owner: req.user?._id
        })
        return res.status(201).json(new ApiResponse(200, tweet, "Tweet created successfully"))
    }
    catch (error) {
        console.log(error);
        throw new ApiError(500, "Error creating tweet")
    }


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }
    try {
        const tweets = await Tweet.aggregate(
            [
                { $match: { owner: new mongoose.Types.ObjectId(userId) } },
                { $sort: { createdAt: -1 } },
            ],
            { collation: { locale: "en" } }
        );

        return res.status(200).json(new ApiResponse(200, tweets, "User tweets retrieved successfully"))
    } catch (error) {
        throw new ApiError(500, "Error retrieving user tweets")
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const { content } = req.body

    if (content.trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "Cant find Tweet")
    }



    try {
        if (tweet?.owner.toString() === user?._id.toString()){

            tweet.content = content
            await tweet.save({ validateBeforeSave: false })
            return res.status(200).json(new ApiResponse(200, tweet, "Tweet updated successfully"))
        }
        else {
            return res.status(403).json(new ApiResponse(403, null, "You are not authorized to update this tweet"));
        }

    } catch (error) {
        throw new ApiError(500, "Error updating tweet")
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }
    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "Cant find Tweet")
    }

    try {
        if (tweet?.owner.toString() == user?._id.toString()) {
            await Tweet.findByIdAndDelete(tweetId)
            return res.status(200).json(new ApiResponse(200, tweet, "Tweet deleted successfully"))
        }
        else {
            throw new ApiError(403, "You are not authorized to delete this tweet")
        }
    } catch (error) {
        throw new ApiError(500, "Error deleting tweet")
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
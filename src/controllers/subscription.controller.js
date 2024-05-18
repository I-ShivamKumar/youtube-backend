import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    const subscriberId = req.user._id

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    try {
        const existingSubscription = await Subscription.findOne({
            subscriber: subscriberId,
            channel: channelId,
        })

        if (existingSubscription) {
            const unSubscribe = await Subscription.findByIdAndDelete(existingSubscription._id)
            if (!unSubscribe){
                return new ApiResponse(400, "Unsubscribing Failed")
            }
            return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully"))
        }

        if(!existingSubscription){
            const newSubscription = await Subscription.create({
                subscriber: subscriberId,
                channel: channelId,
            })
            if(!newSubscription){
                return new ApiResponse(400, "Subscribing Failed")
            }
            return res.status(200).json(new ApiResponse(200, "Subscribed successfully"))
        }


    } catch (error) {
        throw new ApiError(400, "Subscription failed")
    }
    

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    try {

        const subscribers = await Subscription.find({ channel: channelId }).populate("subscriber")
        if (!subscribers) {
            return new ApiResponse(400, "No subscribers found")
        }
        const subscriberCount = await Subscription.countDocuments({
            channel: channelId
        })
        return res.status(200).json(new ApiResponse(200, {subscriberCount ,subscribers} , "Subscribers fetched successfully"))
        
    } catch (error) {
        
    }
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }

    const subscriber = await User.findById(subscriberId)
    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found")
    }

    try {
        const channels = await Subscription.find({ subscriber: subscriberId }).populate("channel")
        if (!channels) {
            return new ApiResponse(400, "No channels found")
        }
        const channelCount = await Subscription.countDocuments({
            subscriber: subscriberId
        })
        if(!channelCount){
            return new ApiResponse(400, "No channels found")
        }
        return res.status(200).json(new ApiResponse(200, {channelCount,channels}, "Channels fetched successfully"))
        
    } catch (error) {
        throw new ApiError(400, "Fetching channels failed")
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
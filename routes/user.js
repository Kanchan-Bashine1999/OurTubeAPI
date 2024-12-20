const express = require("express");
// all routes//
const Router = express.Router();
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth");
const Video = require("../models/Video");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET, // click 'view API keys above the
});

// signup Routes Start//
Router.post("/signup", async (req, res) => {
  try {
    const users = await User.find({ email: req.body.email });
    if (users.length > 0) {
      return res.status(500).json({
        error: "email already registered",
      });
    }

    const hashCode = await bcrypt.hash(req.body.password, 10);
    const uploadedImage = await cloudinary.uploader.upload(
      req.files.logo.tempFilePath
    );

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hashCode,
      logoUrl: uploadedImage.secure_url,
      logoId: uploadedImage.public_id,
    });
    const user = await newUser.save();
    res.status(200).json({
      newUser: user,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({});
  }
}); //signup END//

//logIN start//
Router.post("/login", async (req, res) => {
  try {
    //    console.log(req.body)
    const users = await User.find({ email: req.body.email });
    //    console.log(users)
    if (users.length == 0) {
      return res.status(500).json({
        error: "email is not registered....",
      });
    }
    const isValid = await bcrypt.compare(req.body.password, users[0].password);
    console.log(isValid);
    if (!isValid) {
      return res.status(500).json({
        error: "invalid password",
      });
    }
    const token = jwt.sign(
      {
        _id: users[0]._id,
        channelName: users[0].channelName,
        email: users[0].email,
        phone: users[0].phone,
        logoId: users[0].logoId,
      },
      "FSD online classes 123",
      {
        expiresIn: "365d",
      }
    );
    res.status(200).json({
      _id: users[0]._id,
      channelName: users[0].channelName,
      email: users[0].email,
      phone: users[0].phone,
      logoId: users[0].logoId,
      logourl: users[0].logoUrl,
      token: token,
      subscribers: users[0].subscribers,
      subscribedChannels: users[0].subscribedChannels,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "something went wrong",
    });
  }
});

//subscribe api
Router.put("/subscribe/:userBId", checkAuth, async (req, res) => {
  try {
    const userA = await jwt.verify(
      req.headers.authorization.split(" ")[1],
      "FSD online classes 123"
    );
    console.log(userA);
    const userB = await User.findById(req.params.userBId);
    console.log(userB);
    if (userB.subscribedBy.includes(userA._id)) {
      return res.status(500).json({
        error: "already subscribed...",
      });
    }
    // console.log('not subscribed')
    userB.subscribers += 1;
    userB.subscribedBy.push(userA._id);
    await userB.save();
    const userAFullInformation = await User.findById(userA._id);
    userAFullInformation.subscribedChannels.push(userB._id);
    await userAFullInformation.save();
    res.status(200).json({
      msg: " subscribed...",
    })
  } 
  catch {
    console.log(err);
    res.status(500).json({
      error: 'already subscribed'
    })
  }
})

//unsubscribe api
Router.put('/unsubscribe/:userBId',checkAuth,async(req,res)=>{
    try
    {
        const userA = await jwt.verify(req.headers.authorization.split("")[1],"FSD online classes 123")
        const userB = await User.findById(req.params.userBId)
        console.log(userA)
        console.log(userB)
        if(userB.subscribedBy.includes(userA._id))
        {
            //unsubscribed logic
            userB.subscribers -=1
            userB.subscribedBy= userB.subscribedBy.filter(userId=>userId.toString() != userA._id)
            await userB.save()
            const userAFullInformation = await User.findById(userA._id)
            userAFullInformation.subscribedChannels = userAFullInformation.subscribedChannels.filter(userId=>userId.toString() != userB._id)
            await userAFullInformation.save()

            res.status(200).json({
                msg:'unsubscribed'
            })
        }
        else
        {
            return res.status(500).json({
                error:'not subscribed'
            })
        }
    }
    catch(err)
    {

    }
})
module.exports = Router;

const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")


/** 
* - user register controller
* - POST /api/auth/register
*/

async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body

        const isExists = await userModel.findOne({ email })

        if (isExists) {
            return res.status(422).json({
                message: "User already exists with email.",
                status: "failed"
            })
        }

        const user = await userModel.create({ email, password, name })

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token)

        res.status(201).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

/**
 * - User Login Controller
 * - POST /api/auth/login
 */

async function userLoginController(req, res) {
    try {

        const { email, password } = req.body

        const user = await userModel.findOne({ email }).select("+password")

        if (!user) {
            return res.status(401).json({
                message: "Email or password is INVALID"
            })
        }

        const isValidPassword = await user.comparePassword(password)

        if (!isValidPassword) {
            return res.status(401).json({
                message: "Email or password is INVALID"
            })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token)

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })

    } catch(error) {
        console.error(error)
        res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}

module.exports = {
    userRegisterController,
    userLoginController
}